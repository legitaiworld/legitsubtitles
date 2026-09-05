import { Movie, Language, Subtitle, SubtitleRequest, SubtitleReport, PlatformStats } from '../src/types.js';

export const initialLanguages: Language[] = [
  { id: 'lang-en', name: 'English', native_name: 'English', code: 'en', flag: '🇺🇸' },
  { id: 'lang-es', name: 'Spanish', native_name: 'Español', code: 'es', flag: '🇪🇸' },
  { id: 'lang-fr', name: 'French', native_name: 'Français', code: 'fr', flag: '🇫🇷' },
  { id: 'lang-de', name: 'German', native_name: 'Deutsch', code: 'de', flag: '🇩🇪' },
  { id: 'lang-ja', name: 'Japanese', native_name: '日本語', code: 'ja', flag: '🇯🇵' },
  { id: 'lang-pt', name: 'Portuguese', native_name: 'Português', code: 'pt', flag: '🇧🇷' },
  { id: 'lang-it', name: 'Italian', native_name: 'Italiano', code: 'it', flag: '🇮🇹' },
  { id: 'lang-hi', name: 'Hindi', native_name: 'हिन्दी', code: 'hi', flag: '🇮🇳' },
  { id: 'lang-zh', name: 'Chinese', native_name: '中文', code: 'zh', flag: '🇨🇳' },
  { id: 'lang-ar', name: 'Arabic', native_name: 'العربية', code: 'ar', flag: '🇸🇦' },
  { id: 'lang-ko', name: 'Korean', native_name: '한국어', code: 'ko', flag: '🇰🇷' },
];

export const initialMovies: Movie[] = [
  {
    id: 'movie-1',
    title: 'Night of the Living Dead',
    original_title: 'Night of the Living Dead',
    slug: 'night-of-the-living-dead-1968',
    year: 1968,
    description: 'A ragtag group of Pennsylvanians barricade themselves in an old farmhouse to remain safe from a bloodthirsty, flesh-eating breed of monsters ravaging the East Coast.',
    poster_url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80',
    imdb_id: 'tt0063350',
    tmdb_id: '10331',
    type: 'movie',
    genres: ['Horror', 'Mystery', 'Thriller'],
    runtime: '96 min',
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'movie-2',
    title: 'Charade',
    original_title: 'Charade',
    slug: 'charade-1963',
    year: 1963,
    description: 'Romance and suspense in Paris as a woman is pursued by several men who want a fortune her murdered husband had stolen. Who can she trust?',
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
    imdb_id: 'tt0056923',
    tmdb_id: '4808',
    type: 'movie',
    genres: ['Comedy', 'Mystery', 'Romance', 'Thriller'],
    runtime: '113 min',
    created_at: '2026-08-02T11:00:00Z',
    updated_at: '2026-08-02T11:00:00Z',
  },
  {
    id: 'movie-3',
    title: 'His Girl Friday',
    original_title: 'His Girl Friday',
    slug: 'his-girl-friday-1940',
    year: 1940,
    description: 'A newspaper editor uses every trick in the book to keep his ace reporter ex-wife from remarrying and leaving the newspaper business behind.',
    poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    imdb_id: 'tt0032599',
    tmdb_id: '3085',
    type: 'movie',
    genres: ['Comedy', 'Drama', 'Romance'],
    runtime: '92 min',
    created_at: '2026-08-03T12:00:00Z',
    updated_at: '2026-08-03T12:00:00Z',
  },
  {
    id: 'movie-4',
    title: 'Metropolis',
    original_title: 'Metropolis',
    slug: 'metropolis-1927',
    year: 1927,
    description: 'In a futuristic city sharply divided between the working class and the city planners, the son of the city mastermind falls in love with a working-class prophet.',
    poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    imdb_id: 'tt0017136',
    tmdb_id: '19',
    type: 'movie',
    genres: ['Drama', 'Sci-Fi'],
    runtime: '153 min',
    created_at: '2026-08-04T13:00:00Z',
    updated_at: '2026-08-04T13:00:00Z',
  },
  {
    id: 'movie-5',
    title: 'The General',
    original_title: 'The General',
    slug: 'the-general-1926',
    year: 1926,
    description: 'When Union spies steal an engineer\'s beloved locomotive with his sweetheart aboard, he single-handedly pursues it through enemy lines.',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    imdb_id: 'tt0017925',
    tmdb_id: '961',
    type: 'movie',
    genres: ['Action', 'Adventure', 'Comedy'],
    runtime: '79 min',
    created_at: '2026-08-05T14:00:00Z',
    updated_at: '2026-08-05T14:00:00Z',
  },
  {
    id: 'movie-6',
    title: 'Tears of Steel',
    original_title: 'Tears of Steel',
    slug: 'tears-of-steel-2012',
    year: 2012,
    description: 'Set in a dystopian future in Amsterdam, a group of warriors and scientists gather at the Oude Kerk to stage a crucial event from the past to save the world from destructive robots.',
    poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    imdb_id: 'tt2285752',
    tmdb_id: '124157',
    type: 'movie',
    genres: ['Sci-Fi', 'Short', 'Action'],
    runtime: '12 min',
    created_at: '2026-08-06T15:00:00Z',
    updated_at: '2026-08-06T15:00:00Z',
  },
  {
    id: 'movie-7',
    title: 'Cosmos: The Shores of the Cosmic Ocean',
    original_title: 'Cosmos: A Personal Voyage',
    slug: 'cosmos-a-personal-voyage-1980',
    year: 1980,
    description: 'Astronomer Dr. Carl Sagan conducts an incredible tour of the universe, journeying from the edge of the cosmos through galaxies, stars, and our planetary home.',
    poster_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    imdb_id: 'tt0081846',
    tmdb_id: '1849',
    type: 'tv',
    genres: ['Documentary', 'Science'],
    runtime: '60 min per ep',
    seasons_count: 1,
    episodes_count: 13,
    created_at: '2026-08-07T16:00:00Z',
    updated_at: '2026-08-07T16:00:00Z',
  },
  {
    id: 'movie-8',
    title: 'Sherlock Holmes: The Classic Investigations',
    original_title: 'The Adventures of Sherlock Holmes',
    slug: 'sherlock-holmes-classic-investigations',
    year: 1954,
    description: 'Sherlock Holmes and Dr. John Watson untangle baffling mysteries, jewel heists, and clandestine plots across Victorian and Edwardian London.',
    poster_url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
    imdb_id: 'tt0046636',
    tmdb_id: '3558',
    type: 'tv',
    genres: ['Crime', 'Drama', 'Mystery'],
    runtime: '30 min per ep',
    seasons_count: 1,
    episodes_count: 39,
    created_at: '2026-08-08T17:00:00Z',
    updated_at: '2026-08-08T17:00:00Z',
  },
];

export const sampleSrtNightLivingDeadEn = `1
00:00:15,500 --> 00:00:18,200
They ought to make the day the time changes the first day of summer.

2
00:00:19,000 --> 00:00:21,400
What? It's eight o'clock and it's still light.

3
00:00:22,100 --> 00:00:25,300
A daylight-saving time is what does it.

4
00:00:28,000 --> 00:00:31,200
I don't see why we had to come all the way out here anyway.

5
00:00:32,000 --> 00:00:35,400
Johnny, it's just once a year.
We do it for Mother.

6
00:00:38,500 --> 00:00:41,200
They're coming to get you, Barbra!

7
00:00:42,000 --> 00:00:44,500
Stop it, Johnny! You're acting like a child.

8
00:00:45,100 --> 00:00:48,000
They're coming for you... Look!
There's one of them now!

9
00:00:54,200 --> 00:00:58,000
Johnny, stop it!
Please, don't leave me here!`;

export const sampleSrtNightLivingDeadEs = `1
00:00:15,500 --> 00:00:18,200
Deberían hacer que el cambio de hora sea el primer día de verano.

2
00:00:19,000 --> 00:00:21,400
¿Qué? Son las ocho y todavía hay luz afuera.

3
00:00:22,100 --> 00:00:25,300
El horario de verano es lo que provoca esto.

4
00:00:28,000 --> 00:00:31,200
No entiendo por qué tuvimos que venir tan lejos.

5
00:00:32,000 --> 00:00:35,400
Johnny, es solo una vez al año.
Lo hacemos por mamá.

6
00:00:38,500 --> 00:00:41,200
¡Vienen a buscarte, Barbra!

7
00:00:42,000 --> 00:00:44,500
¡Basta, Johnny! Te estás comportando como un niño.

8
00:00:45,100 --> 00:00:48,000
¡Vienen por ti... Mira!
¡Allí viene uno de ellos!

9
00:00:54,200 --> 00:00:58,000
¡Johnny, detente!
¡Por favor, no me dejes aquí sola!`;

export const sampleSrtCharadeEn = `1
00:00:12,000 --> 00:00:15,500
Do you know what's wrong with you, Mr. Joshua?

2
00:00:16,200 --> 00:00:18,900
No, Mrs. Lampert. What?

3
00:00:19,500 --> 00:00:22,800
Nothing. Absolutely nothing.
And that's what's so frustrating.

4
00:00:24,000 --> 00:00:27,300
I already have a wife, you know.
We're divorced.

5
00:00:28,100 --> 00:00:31,000
Then you don't have a wife, Mr. Joshua.
You had one.

6
00:00:32,400 --> 00:00:36,100
Any minute now, my husband will return to Paris.
Or so I believed.`;

export const sampleSrtCharadeFr = `1
00:00:12,000 --> 00:00:15,500
Savez-vous ce qui ne va pas chez vous, Monsieur Joshua ?

2
00:00:16,200 --> 00:00:18,900
Non, Madame Lampert. Quoi donc ?

3
00:00:19,500 --> 00:00:22,800
Rien. Absolument rien.
Et c'est précisément ce qui est si exaspérant.

4
00:00:24,000 --> 00:00:27,300
J'ai déjà une femme, vous savez.
Enfin, nous sommes divorcés.

5
00:00:28,100 --> 00:00:31,000
Alors vous n'avez pas de femme.
Vous en aviez une.

6
00:00:32,400 --> 00:00:36,100
D'une minute à l'autre, mon mari reviendra à Paris.
Du moins, c'est ce que je croyais.`;

export const sampleSrtHisGirlFridayEn = `1
00:00:10,000 --> 00:00:13,200
Morning, Hildy. Walter's in the conference room.

2
00:00:13,800 --> 00:00:16,400
Tell him I don't care where he is, Duffy.
I came to say goodbye.

3
00:00:17,000 --> 00:00:20,500
Goodbye? What do you mean goodbye?
The paper needs your lead story on Earl Williams!

4
00:00:21,000 --> 00:00:24,500
I'm getting married tomorrow, Duffy.
To a respectable insurance man in Albany.`;

export const sampleSrtMetropolisDe = `1
00:00:30,000 --> 00:00:34,000
Hoch liegt die Stadt der Herren,
tief im Dunkeln die Stadt der Arbeiter.

2
00:00:35,500 --> 00:00:39,000
Wer die Maschinen bedient,
dient dem Herzen der Metropole.

3
00:00:41,000 --> 00:00:45,500
Mittler zwischen Hirn und Händen
muss das Herz sein!`;

export const initialSubtitles: Subtitle[] = [
  {
    id: 'sub-1',
    movie_id: 'movie-1',
    language_id: 'lang-en',
    file_path: 'subtitles/movie-1/en/Night_of_the_Living_Dead_1968.1080p.BluRay.srt',
    file_format: 'srt',
    release_name: '1080p.BluRay.x264-SublyRelease',
    version: '1.2.0',
    quality_score: 98,
    downloads: 1420,
    status: 'approved',
    uploaded_by: 'CinemaArchivist',
    content: sampleSrtNightLivingDeadEn,
    created_at: '2026-08-10T12:00:00Z',
    updated_at: '2026-08-10T12:00:00Z',
  },
  {
    id: 'sub-2',
    movie_id: 'movie-1',
    language_id: 'lang-es',
    file_path: 'subtitles/movie-1/es/La_Noche_de_los_Muertos_Vivientes.1080p.srt',
    file_format: 'srt',
    release_name: '1080p.BDRip.Castellano-Latino',
    version: '1.0.0',
    quality_score: 95,
    downloads: 980,
    status: 'approved',
    uploaded_by: 'SubTitlerPro',
    content: sampleSrtNightLivingDeadEs,
    created_at: '2026-08-11T13:30:00Z',
    updated_at: '2026-08-11T13:30:00Z',
  },
  {
    id: 'sub-3',
    movie_id: 'movie-2',
    language_id: 'lang-en',
    file_path: 'subtitles/movie-2/en/Charade_1963.Criterion.1080p.srt',
    file_format: 'srt',
    release_name: 'Criterion.Remastered.1080p.BluRay',
    version: '2.0.1',
    quality_score: 99,
    downloads: 875,
    status: 'approved',
    uploaded_by: 'AudreyFan99',
    content: sampleSrtCharadeEn,
    created_at: '2026-08-12T10:00:00Z',
    updated_at: '2026-08-12T10:00:00Z',
  },
  {
    id: 'sub-4',
    movie_id: 'movie-2',
    language_id: 'lang-fr',
    file_path: 'subtitles/movie-2/fr/Charade_1963.VF.WEB-DL.srt',
    file_format: 'srt',
    release_name: 'WEB-DL.1080p.x264.FR',
    version: '1.1.0',
    quality_score: 96,
    downloads: 640,
    status: 'approved',
    uploaded_by: 'TraducteurParis',
    content: sampleSrtCharadeFr,
    created_at: '2026-08-13T15:20:00Z',
    updated_at: '2026-08-13T15:20:00Z',
  },
  {
    id: 'sub-5',
    movie_id: 'movie-3',
    language_id: 'lang-en',
    file_path: 'subtitles/movie-3/en/His_Girl_Friday_1940.720p.HD.srt',
    file_format: 'srt',
    release_name: '720p.HD.FastDialogue-Sync',
    version: '1.0.0',
    quality_score: 94,
    downloads: 512,
    status: 'approved',
    uploaded_by: 'RapidTypist',
    content: sampleSrtHisGirlFridayEn,
    created_at: '2026-08-14T09:10:00Z',
    updated_at: '2026-08-14T09:10:00Z',
  },
  {
    id: 'sub-6',
    movie_id: 'movie-4',
    language_id: 'lang-de',
    file_path: 'subtitles/movie-4/de/Metropolis_1927.FritzLang.DE.srt',
    file_format: 'srt',
    release_name: 'FritzLang.Restored.2010.1080p',
    version: '3.0.0',
    quality_score: 99,
    downloads: 1205,
    status: 'approved',
    uploaded_by: 'BerlinCinema',
    content: sampleSrtMetropolisDe,
    created_at: '2026-08-15T16:00:00Z',
    updated_at: '2026-08-15T16:00:00Z',
  },
  {
    id: 'sub-7',
    movie_id: 'movie-7',
    language_id: 'lang-en',
    file_path: 'subtitles/movie-7/en/Cosmos_S01E01.Shores_of_Cosmic_Ocean.srt',
    file_format: 'srt',
    release_name: 'Season 1 Episode 1 - 1080p.Remaster',
    version: '1.0',
    quality_score: 97,
    downloads: 890,
    status: 'approved',
    uploaded_by: 'StarGazer',
    content: sampleSrtNightLivingDeadEn, // placeholder demo dialogue
    season: 1,
    episode: 1,
    created_at: '2026-08-16T18:00:00Z',
    updated_at: '2026-08-16T18:00:00Z',
  },
  {
    id: 'sub-pending-1',
    movie_id: 'movie-5',
    language_id: 'lang-ja',
    file_path: 'subtitles/movie-5/ja/The_General_1926.BusterKeaton.ja.srt',
    file_format: 'srt',
    release_name: 'The.General.1926.BDRip.Japanese.v1',
    version: '1.0.0',
    quality_score: 91,
    downloads: 0,
    status: 'pending',
    uploaded_by: 'TokyoKitsune',
    content: `1\n00:00:10,000 --> 00:00:14,000\nジョン・ジョニーの恋人は、機関車とアナベルだった。\n\n2\n00:00:15,000 --> 00:00:18,500\nしかし戦争が始まり、彼は立ち上がらなければならなかった。`,
    created_at: '2026-09-02T11:00:00Z',
    updated_at: '2026-09-02T11:00:00Z',
  }
];

export const initialRequests: SubtitleRequest[] = [
  {
    id: 'req-1',
    movie_title: 'Sita Sings the Blues',
    year: 2008,
    language_id: 'lang-hi',
    requested_by: 'Arjun M.',
    notes: 'Looking for Hindi subtitles for the musical segments and shadow puppet dialogues.',
    votes: 42,
    status: 'open',
    created_at: '2026-08-20T14:00:00Z',
  },
  {
    id: 'req-2',
    movie_title: 'Carnival of Souls',
    year: 1962,
    language_id: 'lang-pt',
    requested_by: 'Camila Silva',
    notes: 'Criterion 1080p release timing preferred for Portuguese (Brazil).',
    votes: 28,
    status: 'open',
    created_at: '2026-08-24T09:30:00Z',
  },
  {
    id: 'req-3',
    movie_title: 'The Cabinet of Dr. Caligari',
    year: 1920,
    language_id: 'lang-es',
    requested_by: 'Diego R.',
    notes: '4K restoration intertitle subtitles in Spanish.',
    votes: 65,
    status: 'in_progress',
    created_at: '2026-08-15T18:20:00Z',
  },
];

export const initialReports: SubtitleReport[] = [
  {
    id: 'rep-1',
    subtitle_id: 'sub-5',
    user_id: 'user-reporter-1',
    reason: 'desync',
    description: 'The dialogue is approximately 1.5 seconds delayed after the 45-minute mark on the 720p WEB-DL copy.',
    status: 'pending',
    created_at: '2026-09-01T15:45:00Z',
  },
];

class MemoryDataStore {
  private languages: Language[] = [...initialLanguages];
  private movies: Movie[] = [...initialMovies];
  private subtitles: Subtitle[] = [...initialSubtitles];
  private requests: SubtitleRequest[] = [...initialRequests];
  private reports: SubtitleReport[] = [...initialReports];
  private downloadLogs: Array<{ id: string; subtitle_id: string; date: string; ipHash: string }> = [];

  // Languages
  getLanguages(): Language[] {
    return this.languages.map(lang => {
      const count = this.subtitles.filter(s => s.language_id === lang.id && s.status === 'approved').length;
      return { ...lang, subtitles_count: count };
    });
  }

  getLanguageById(id: string): Language | undefined {
    return this.languages.find(l => l.id === id || l.code === id);
  }

  // Movies
  getMovies(params?: { query?: string; type?: string; language?: string; sort?: string }): Movie[] {
    let result = [...this.movies];

    if (params?.query) {
      const q = params.query.toLowerCase().trim();
      result = result.filter(m => 
        m.title.toLowerCase().includes(q) ||
        (m.original_title && m.original_title.toLowerCase().includes(q)) ||
        m.genres.some(g => g.toLowerCase().includes(q)) ||
        m.year.toString().includes(q)
      );
    }

    if (params?.type && params.type !== 'all') {
      result = result.filter(m => m.type === params.type);
    }

    if (params?.language && params.language !== 'all') {
      const langSubtitles = this.subtitles.filter(s => 
        s.status === 'approved' && 
        (s.language_id === params.language || this.getLanguageById(s.language_id)?.code === params.language)
      );
      const movieIds = new Set(langSubtitles.map(s => s.movie_id));
      result = result.filter(m => movieIds.has(m.id));
    }

    // Attach available languages and subtitle count to each movie
    return result.map(m => {
      const subs = this.subtitles.filter(s => s.movie_id === m.id && s.status === 'approved');
      const langIds = Array.from(new Set(subs.map(s => s.language_id)));
      const langs = langIds.map(id => this.getLanguageById(id)).filter(Boolean) as Language[];
      return {
        ...m,
        available_languages: langs,
        subtitles_count: subs.length,
      };
    });
  }

  getMovieBySlug(slug: string): Movie | undefined {
    const movie = this.movies.find(m => m.slug === slug || m.id === slug);
    if (!movie) return undefined;

    const subs = this.subtitles.filter(s => s.movie_id === movie.id && s.status === 'approved');
    const langIds = Array.from(new Set(subs.map(s => s.language_id)));
    const langs = langIds.map(id => this.getLanguageById(id)).filter(Boolean) as Language[];

    return {
      ...movie,
      available_languages: langs,
      subtitles_count: subs.length,
    };
  }

  addMovie(data: Omit<Movie, 'id' | 'created_at' | 'updated_at' | 'slug'>): Movie {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${data.year}`;
    const newMovie: Movie = {
      ...data,
      id: `movie-${Date.now()}`,
      slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.movies.unshift(newMovie);
    return newMovie;
  }

  updateMovie(id: string, data: Partial<Movie>): Movie | null {
    const idx = this.movies.findIndex(m => m.id === id);
    if (idx === -1) return null;
    this.movies[idx] = {
      ...this.movies[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return this.movies[idx];
  }

  deleteMovie(id: string): boolean {
    const initialLen = this.movies.length;
    this.movies = this.movies.filter(m => m.id !== id);
    this.subtitles = this.subtitles.filter(s => s.movie_id !== id);
    return this.movies.length < initialLen;
  }

  // Subtitles
  getSubtitles(params?: { movieId?: string; languageId?: string; status?: string }): Subtitle[] {
    let result = [...this.subtitles];

    if (params?.movieId) {
      result = result.filter(s => s.movie_id === params.movieId);
    }
    if (params?.languageId && params.languageId !== 'all') {
      result = result.filter(s => s.language_id === params.languageId || this.getLanguageById(s.language_id)?.code === params.languageId);
    }
    if (params?.status) {
      result = result.filter(s => s.status === params.status);
    }

    return result.map(s => ({
      ...s,
      language: this.getLanguageById(s.language_id),
      movie: this.movies.find(m => m.id === s.movie_id),
    }));
  }

  getSubtitleById(id: string): Subtitle | undefined {
    const sub = this.subtitles.find(s => s.id === id);
    if (!sub) return undefined;
    return {
      ...sub,
      language: this.getLanguageById(sub.language_id),
      movie: this.movies.find(m => m.id === sub.movie_id),
    };
  }

  addSubtitle(data: Omit<Subtitle, 'id' | 'downloads' | 'created_at' | 'updated_at'>): Subtitle {
    const newSub: Subtitle = {
      ...data,
      id: `sub-${Date.now()}`,
      downloads: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.subtitles.unshift(newSub);
    return newSub;
  }

  updateSubtitleStatus(id: string, status: Subtitle['status']): Subtitle | null {
    const sub = this.subtitles.find(s => s.id === id);
    if (!sub) return null;
    sub.status = status;
    sub.updated_at = new Date().toISOString();
    return sub;
  }

  deleteSubtitle(id: string): boolean {
    const initialLen = this.subtitles.length;
    this.subtitles = this.subtitles.filter(s => s.id !== id);
    return this.subtitles.length < initialLen;
  }

  recordDownload(subtitleId: string, ipHash: string): Subtitle | null {
    const sub = this.subtitles.find(s => s.id === subtitleId);
    if (!sub) return null;
    sub.downloads += 1;
    this.downloadLogs.push({
      id: `dl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      subtitle_id: subtitleId,
      date: new Date().toISOString(),
      ipHash,
    });
    return sub;
  }

  // Requests
  getRequests(): SubtitleRequest[] {
    return this.requests.map(r => ({
      ...r,
      language: this.getLanguageById(r.language_id),
    }));
  }

  addRequest(data: Omit<SubtitleRequest, 'id' | 'votes' | 'created_at' | 'status'>): SubtitleRequest {
    const newReq: SubtitleRequest = {
      ...data,
      id: `req-${Date.now()}`,
      votes: 1,
      status: 'open',
      created_at: new Date().toISOString(),
    };
    this.requests.unshift(newReq);
    return newReq;
  }

  voteRequest(id: string): SubtitleRequest | null {
    const req = this.requests.find(r => r.id === id);
    if (!req) return null;
    req.votes += 1;
    return req;
  }

  updateRequestStatus(id: string, status: SubtitleRequest['status']): SubtitleRequest | null {
    const req = this.requests.find(r => r.id === id);
    if (!req) return null;
    req.status = status;
    return req;
  }

  // Reports
  getReports(): SubtitleReport[] {
    return this.reports.map(r => ({
      ...r,
      subtitle: this.getSubtitleById(r.subtitle_id),
    }));
  }

  addReport(data: Omit<SubtitleReport, 'id' | 'created_at' | 'status'>): SubtitleReport {
    const newRep: SubtitleReport = {
      ...data,
      id: `rep-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.reports.unshift(newRep);
    return newRep;
  }

  updateReportStatus(id: string, status: SubtitleReport['status']): SubtitleReport | null {
    const rep = this.reports.find(r => r.id === id);
    if (!rep) return null;
    rep.status = status;
    return rep;
  }

  // Stats
  getStats(): PlatformStats {
    const totalDownloads = this.subtitles.reduce((acc, s) => acc + s.downloads, 0);
    const pendingSubs = this.subtitles.filter(s => s.status === 'pending').length;
    const openReqs = this.requests.filter(r => r.status === 'open').length;
    const unresReports = this.reports.filter(r => r.status === 'pending').length;

    return {
      movies_count: this.movies.length,
      subtitles_count: this.subtitles.filter(s => s.status === 'approved').length,
      languages_count: this.languages.length,
      total_downloads: totalDownloads,
      pending_subtitles_count: pendingSubs,
      open_requests_count: openReqs,
      unresolved_reports_count: unresReports,
    };
  }
}

export const store = new MemoryDataStore();
