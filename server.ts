import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { store } from './server/dataStore.js';
import { validateSubtitleContent } from './server/subtitleValidator.js';
import {
  aiDetectLanguage,
  aiAnalyzeQuality,
  aiTranslateSubtitle,
  aiCleanSubtitle,
} from './server/geminiAi.js';
import { pullOrGenerateSubtitle } from './server/subtitleApiProvider.js';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger for API calls
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // 1. System Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 2. Platform Statistics
  app.get('/api/stats', (req, res) => {
    const stats = store.getStats();
    res.json(stats);
  });

  // 3. Languages Catalog
  app.get('/api/languages', (req, res) => {
    const languages = store.getLanguages();
    res.json(languages);
  });

  // 4. Movies Search and Listing
  app.get('/api/movies', (req, res) => {
    const { q, type, language, sort } = req.query;
    const movies = store.getMovies({
      query: typeof q === 'string' ? q : undefined,
      type: typeof type === 'string' ? type : undefined,
      language: typeof language === 'string' ? language : undefined,
      sort: typeof sort === 'string' ? sort : undefined,
    });
    res.json(movies);
  });

  // 5. Movie Detail by Slug
  app.get('/api/movies/:slug', (req, res) => {
    const movie = store.getMovieBySlug(req.params.slug);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  });

  // 6. Subtitles for a specific Movie
  app.get('/api/movies/:slug/subtitles', (req, res) => {
    const movie = store.getMovieBySlug(req.params.slug);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    const { language, status } = req.query;
    const subtitles = store.getSubtitles({
      movieId: movie.id,
      languageId: typeof language === 'string' ? language : undefined,
      status: typeof status === 'string' ? status : 'approved',
    });
    res.json(subtitles);
  });

  // 7. Subtitle Detail & Content
  app.get('/api/subtitles/:id', (req, res) => {
    const subtitle = store.getSubtitleById(req.params.id);
    if (!subtitle) {
      return res.status(404).json({ error: 'Subtitle not found' });
    }
    res.json(subtitle);
  });

  // 8. Secure Subtitle Download Flow (Records download event and provides raw file download)
  app.get('/api/subtitles/:id/download', (req, res) => {
    const subtitle = store.getSubtitleById(req.params.id);
    if (!subtitle) {
      return res.status(404).json({ error: 'Subtitle not found' });
    }

    if (subtitle.status !== 'approved') {
      return res.status(403).json({ error: 'Subtitle is pending moderation or not approved for public download' });
    }

    // Hash client IP for privacy-preserving rate analytics
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const ipHash = crypto.createHash('sha256').update(String(clientIp)).digest('hex').slice(0, 16);

    // Record download event in audit store
    store.recordDownload(subtitle.id, ipHash);

    // Prepare filename
    const movieTitleClean = (subtitle.movie?.title || 'Subly')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const langCode = subtitle.language?.code || 'und';
    const filename = `${movieTitleClean}.${subtitle.release_name || 'Subly'}.${langCode}.${subtitle.file_format}`;

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Subly-Downloads', String(subtitle.downloads));

    res.send(subtitle.content);
  });

  // 8b. Real-Time Subtitle Search & Pull Engine (Uses Subtitle APIs + Gemini Multilingual Localization)
  app.post('/api/subtitles/pull', async (req, res) => {
    try {
      const { movie_title, target_language_name, target_language_code, year, uploaded_srt } = req.body;
      if (!movie_title || typeof movie_title !== 'string' || movie_title.trim() === '') {
        return res.status(400).json({ error: 'Movie or series title is required' });
      }

      const langName = target_language_name || 'English';
      const langCode = target_language_code || 'en';

      const result = await pullOrGenerateSubtitle({
        movieTitle: movie_title.trim(),
        targetLanguageName: langName,
        targetLanguageCode: langCode,
        year: year ? Number(year) : undefined,
        uploadedSrt: typeof uploaded_srt === 'string' ? uploaded_srt : undefined,
      });

      res.json(result);
    } catch (err: any) {
      console.error('Error in /api/subtitles/pull:', err);
      res.status(500).json({ error: err.message || 'Failed to pull subtitle' });
    }
  });

  // 8c. Save Pulled Subtitle to Platform Library
  app.post('/api/subtitles/save-pulled', (req, res) => {
    try {
      const { movieTitle, year, posterUrl, overview, language, content, releaseName } = req.body;
      if (!movieTitle || !content || !language) {
        return res.status(400).json({ error: 'Movie title, language, and content are required' });
      }

      // Check if movie already exists or create new
      const existingMovies = store.getMovies();
      let matchedMovie = existingMovies.find(
        m => m.title.toLowerCase() === movieTitle.toLowerCase()
      );

      if (!matchedMovie) {
        matchedMovie = store.addMovie({
          title: movieTitle,
          year: year || 2024,
          description: overview || `Subtitles for ${movieTitle}`,
          poster_url: posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
          type: 'movie',
          genres: ['International', 'Drama'],
          runtime: '105 min',
        });
      }

      // Find or create language
      let targetLang = store.getLanguages().find(
        l => l.code.toLowerCase() === (language.code || '').toLowerCase()
      );

      if (!targetLang) {
        targetLang = {
          id: `lang-${language.code || 'custom'}`,
          name: language.name || 'Custom Language',
          native_name: language.nativeName || language.name,
          code: language.code || 'custom',
          flag: language.flag || '🌐',
        };
      }

      const newSubtitle = store.addSubtitle({
        movie_id: matchedMovie.id,
        language_id: targetLang.id,
        file_format: 'srt',
        release_name: releaseName || `${movieTitle}.Multilingual.API.Sync`,
        version: '1.0.0',
        quality_score: 99,
        status: 'approved',
        uploaded_by: 'Community API Pull',
        content,
      });

      res.status(201).json({
        success: true,
        movie: matchedMovie,
        subtitle: newSubtitle,
      });
    } catch (err: any) {
      console.error('Error saving pulled subtitle:', err);
      res.status(500).json({ error: err.message || 'Failed to save subtitle' });
    }
  });

  // 9. Subtitle File Validation
  app.post('/api/subtitles/validate', (req, res) => {
    const { content, format } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }
    const report = validateSubtitleContent(content, format);
    res.json(report);
  });

  // 10. Subtitle Requests
  app.get('/api/requests', (req, res) => {
    const requests = store.getRequests();
    res.json(requests);
  });

  app.post('/api/requests', (req, res) => {
    const { movie_title, year, language_id, requested_by, notes } = req.body;
    if (!movie_title || !year || !language_id) {
      return res.status(400).json({ error: 'Title, year, and target language are required' });
    }
    const request = store.addRequest({
      movie_title,
      year: Number(year),
      language_id,
      requested_by: requested_by || 'Anonymous Seeker',
      notes,
    });
    res.status(201).json(request);
  });

  app.post('/api/requests/:id/vote', (req, res) => {
    const updated = store.voteRequest(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(updated);
  });

  // 11. Subtitle Reports
  app.get('/api/reports', (req, res) => {
    const reports = store.getReports();
    res.json(reports);
  });

  app.post('/api/reports', (req, res) => {
    const { subtitle_id, reason, description, user_id } = req.body;
    if (!subtitle_id || !reason || !description) {
      return res.status(400).json({ error: 'Subtitle ID, reason, and description are required' });
    }
    const report = store.addReport({
      subtitle_id,
      reason,
      description,
      user_id: user_id || 'anonymous_user',
    });
    res.status(201).json(report);
  });

  app.put('/api/reports/:id/status', (req, res) => {
    const { status } = req.body;
    if (!['pending', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid report status' });
    }
    const updated = store.updateReportStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(updated);
  });

  // 12. Admin Subtitle Management
  app.get('/api/admin/subtitles', (req, res) => {
    const { status } = req.query;
    const subtitles = store.getSubtitles({
      status: typeof status === 'string' ? status : undefined,
    });
    res.json(subtitles);
  });

  app.post('/api/admin/subtitles/upload', (req, res) => {
    const {
      movie_id,
      language_id,
      file_format,
      release_name,
      version,
      content,
      uploaded_by,
      season,
      episode,
      auto_approve,
    } = req.body;

    if (!movie_id || !language_id || !content) {
      return res.status(400).json({ error: 'Movie, language, and subtitle content are required' });
    }

    // Validate subtitle content first
    const validation = validateSubtitleContent(content, file_format || 'srt');
    if (!validation.isValid) {
      return res.status(422).json({
        error: 'Subtitle validation failed with structural errors',
        validation,
      });
    }

    const movie = store.getMovies().find(m => m.id === movie_id);
    const lang = store.getLanguageById(language_id);
    const langCode = lang?.code || 'und';
    const filePath = `subtitles/${movie_id}/${langCode}/${release_name || 'custom'}.${file_format || 'srt'}`;

    const subtitle = store.addSubtitle({
      movie_id,
      language_id,
      file_path: filePath,
      file_format: file_format || 'srt',
      release_name: release_name || 'Standard.Community.Release',
      version: version || '1.0',
      quality_score: validation.issues.length === 0 ? 99 : Math.max(75, 95 - validation.issues.length * 3),
      status: auto_approve ? 'approved' : 'pending',
      uploaded_by: uploaded_by || 'Admin / Community Contributor',
      content,
      season: season ? Number(season) : undefined,
      episode: episode ? Number(episode) : undefined,
    });

    res.status(201).json({ subtitle, validation });
  });

  app.put('/api/admin/subtitles/:id/status', (req, res) => {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected', 'removed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const updated = store.updateSubtitleStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Subtitle not found' });
    }
    res.json(updated);
  });

  app.delete('/api/admin/subtitles/:id', (req, res) => {
    const success = store.deleteSubtitle(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Subtitle not found' });
    }
    res.json({ message: 'Subtitle deleted successfully' });
  });

  // 13. Admin Movies Management
  app.post('/api/admin/movies', (req, res) => {
    const { title, original_title, year, description, poster_url, type, genres, runtime, imdb_id, tmdb_id } = req.body;
    if (!title || !year) {
      return res.status(400).json({ error: 'Title and year are required' });
    }
    const movie = store.addMovie({
      title,
      original_title,
      year: Number(year),
      description: description || 'No synopsis provided.',
      poster_url: poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      type: type === 'tv' ? 'tv' : 'movie',
      genres: Array.isArray(genres) ? genres : ['Drama'],
      runtime: runtime || '100 min',
      imdb_id,
      tmdb_id,
    });
    res.status(201).json(movie);
  });

  app.put('/api/admin/movies/:id', (req, res) => {
    const updated = store.updateMovie(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(updated);
  });

  app.delete('/api/admin/movies/:id', (req, res) => {
    const success = store.deleteMovie(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json({ message: 'Movie and associated subtitles deleted successfully' });
  });

  // 14. Gemini AI Layer
  app.post('/api/ai/detect-language', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text sample is required' });
      }
      const result = await aiDetectLanguage(text);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI detection failed' });
    }
  });

  app.post('/api/ai/quality-analysis', async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Subtitle content is required' });
      }
      const report = await aiAnalyzeQuality(content);
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI quality analysis failed' });
    }
  });

  app.post('/api/ai/translate', async (req, res) => {
    try {
      const { content, targetLanguage } = req.body;
      if (!content || !targetLanguage) {
        return res.status(400).json({ error: 'Content and target language are required' });
      }
      const result = await aiTranslateSubtitle(content, targetLanguage);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI translation failed' });
    }
  });

  app.post('/api/ai/clean', async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }
      const result = await aiCleanSubtitle(content);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI cleanup failed' });
    }
  });

  // Mount Vite or static file serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Subly server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
