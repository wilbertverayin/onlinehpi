export const RED_FLAG_MESSAGE = 'Go to the nearest emergency room now.';

const RED_FLAG_PATTERNS = [
  /chest\s+pain/i,
  /sakit\s+(sa|ng)\s+dibdib/i,
  /shortness\s+of\s+breath/i,
  /(difficulty|trouble)\s+breathing/i,
  /hirap(an)?\s+(sa\s+pag)?(hinga|huminga)/i,
  /nahihirapan\s+(akong\s+)?(huminga|sa\s+paghinga)/i,
  /hindi\s+(ako\s+)?makahinga/i,
];

export function isRedFlagAnswer(answer: string): boolean {
  return RED_FLAG_PATTERNS.some(pattern => pattern.test(answer));
}
