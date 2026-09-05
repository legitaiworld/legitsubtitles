import { SubtitleFormat, SubtitleValidationReport, ValidationIssue } from '../src/types.js';

interface ParsedCue {
  index: number;
  startTimeStr: string;
  endTimeStr: string;
  startTimeMs: number;
  endTimeMs: number;
  text: string;
}

function parseTimeToMs(timeStr: string): number | null {
  // Matches "00:01:23,456" or "00:01:23.456" or "01:23.456"
  const cleaned = timeStr.trim().replace(',', '.');
  const parts = cleaned.split(':');
  
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
    return Math.round((hours * 3600 + minutes * 60 + seconds) * 1000);
  } else if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    if (isNaN(minutes) || isNaN(seconds)) return null;
    return Math.round((minutes * 60 + seconds) * 1000);
  }
  return null;
}

function formatMsToTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function validateSubtitleContent(content: string, claimedFormat?: SubtitleFormat): SubtitleValidationReport {
  const issues: ValidationIssue[] = [];
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  
  // Format detection
  let format: SubtitleFormat = claimedFormat || 'srt';
  if (content.startsWith('WEBVTT')) {
    format = 'vtt';
  } else if (content.includes('[Script Info]') || content.includes('Dialogue:')) {
    format = 'ass';
  }

  const cues: ParsedCue[] = [];
  let currentCueIndex = 0;
  let currentStart = '';
  let currentEnd = '';
  let currentStartMs = 0;
  let currentEndMs = 0;
  let currentTextLines: string[] = [];
  let isParsingCue = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for SRT / VTT arrow
    if (line.includes('-->')) {
      // Flush previous cue if pending
      if (isParsingCue) {
        cues.push({
          index: currentCueIndex,
          startTimeStr: currentStart,
          endTimeStr: currentEnd,
          startTimeMs: currentStartMs,
          endTimeMs: currentEndMs,
          text: currentTextLines.join('\n').trim(),
        });
        currentTextLines = [];
      }

      const timeParts = line.split('-->');
      if (timeParts.length !== 2) {
        issues.push({
          type: 'error',
          line: i + 1,
          message: `Malformed timestamp line: "${line}"`,
        });
        continue;
      }

      const startMs = parseTimeToMs(timeParts[0]);
      const endMs = parseTimeToMs(timeParts[1].split(' ')[0]); // strip cue settings if VTT

      if (startMs === null || endMs === null) {
        issues.push({
          type: 'error',
          line: i + 1,
          message: `Invalid timestamp format at line ${i + 1}: "${line}"`,
        });
      } else {
        if (endMs <= startMs) {
          issues.push({
            type: 'error',
            line: i + 1,
            message: `Reversed or zero-duration timestamp at line ${i + 1}: Start (${timeParts[0].trim()}) is after or equal to End (${timeParts[1].trim()})`,
          });
        }
        currentCueIndex++;
        currentStart = timeParts[0].trim();
        currentEnd = timeParts[1].trim();
        currentStartMs = startMs;
        currentEndMs = endMs;
        isParsingCue = true;
      }
    } else if (isParsingCue) {
      if (line === '') {
        // Blank line ends cue
        cues.push({
          index: currentCueIndex,
          startTimeStr: currentStart,
          endTimeStr: currentEnd,
          startTimeMs: currentStartMs,
          endTimeMs: currentEndMs,
          text: currentTextLines.join('\n').trim(),
        });
        currentTextLines = [];
        isParsingCue = false;
      } else {
        currentTextLines.push(line);
      }
    }
  }

  // Flush last cue
  if (isParsingCue) {
    cues.push({
      index: currentCueIndex,
      startTimeStr: currentStart,
      endTimeStr: currentEnd,
      startTimeMs: currentStartMs,
      endTimeMs: currentEndMs,
      text: currentTextLines.join('\n').trim(),
    });
  }

  // Post cue checks: overlaps, empty text, line length
  let previousEndMs = 0;
  let totalChars = 0;
  let maxEndTimeMs = 0;

  cues.forEach((cue, idx) => {
    totalChars += cue.text.length;
    if (cue.endTimeMs > maxEndTimeMs) {
      maxEndTimeMs = cue.endTimeMs;
    }

    // Check empty text
    if (!cue.text || cue.text.length === 0) {
      issues.push({
        type: 'warning',
        captionIndex: cue.index,
        message: `Caption #${cue.index} (${cue.startTimeStr}) has empty dialogue text.`,
      });
    }

    // Check overlapping timestamps
    if (idx > 0 && cue.startTimeMs < previousEndMs) {
      const overlapMs = previousEndMs - cue.startTimeMs;
      if (overlapMs > 200) { // Tolerate tiny 200ms audio blend
        issues.push({
          type: 'warning',
          captionIndex: cue.index,
          message: `Caption #${cue.index} starts at ${cue.startTimeStr} before previous caption finishes (${formatMsToTime(previousEndMs)}) by ${overlapMs}ms.`,
        });
      }
    }
    previousEndMs = Math.max(previousEndMs, cue.endTimeMs);

    // Check overly long single lines (standards recommend max 45-50 chars per line)
    const cueLines = cue.text.split('\n');
    cueLines.forEach(l => {
      if (l.length > 55) {
        issues.push({
          type: 'warning',
          captionIndex: cue.index,
          message: `Caption #${cue.index} line exceeds recommended display width (${l.length} chars): "${l.slice(0, 35)}..."`,
        });
      }
    });
  });

  if (cues.length === 0) {
    issues.push({
      type: 'error',
      message: 'No valid subtitle cues or timestamps found in the file content.',
    });
  }

  const hasErrors = issues.some(i => i.type === 'error');

  return {
    isValid: !hasErrors && cues.length > 0,
    format,
    captionCount: cues.length,
    durationFormatted: formatMsToTime(maxEndTimeMs),
    totalCharacters: totalChars,
    issues: issues.slice(0, 20), // Top 20 issues for readability
  };
}
