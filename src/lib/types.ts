export interface EventCandidate {
  title: string;
  start: { date: string; time: string };
  end: { date: string; time: string } | null;
  duration_minutes: number | null;
  timezone: string | null;
  location: string | null;
  notes: string | null;
  confidence: {
    title: number;
    start: number;
    end_or_duration: number;
    timezone: number;
    location: number;
    notes: number;
  };
  evidence: {
    matched_text_snippets: string[];
  };
}

export interface ExtractionResult {
  events: EventCandidate[];
}

export interface CreatedEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  notes?: string;
  timezone: string;
  calendarId: string;
  googleEventId?: string;
  googleLink?: string;
  screenshotUrl?: string;
  extractedJson?: EventCandidate;
  createdAt: string;
  colorIndex: number;
}

export const CANDY_COLORS = [
  'candy-coral',
  'candy-mint', 
  'candy-purple',
  'candy-yellow',
  'candy-blue',
  'candy-pink',
  'candy-orange',
  'candy-teal',
] as const;

export type CandyColor = typeof CANDY_COLORS[number];

export function getCandyColor(index: number): CandyColor {
  return CANDY_COLORS[index % CANDY_COLORS.length];
}

export function getCandyColorClass(index: number): string {
  const color = getCandyColor(index);
  return `bg-${color}`;
}
