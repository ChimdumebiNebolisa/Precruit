/**
 * Locked fallback formula for probability 0–100.
 * M1.2: start 10; +30 hiring_spike_7d, +25 eng_hiring_14d, +20 churn_14d, +10 early_career_language; clamp 0–100.
 */

export interface FallbackSignals {
  hiring_spike_7d: boolean;
  eng_hiring_14d: boolean;
  churn_14d: boolean;
  early_career_language: boolean;
}

const BASE = 10;
const BONUSES = {
  hiring_spike_7d: 30,
  eng_hiring_14d: 25,
  churn_14d: 20,
  early_career_language: 10,
} as const;

export function computeFallbackProbability(signals: FallbackSignals): number {
  let score = BASE;
  if (signals.hiring_spike_7d) score += BONUSES.hiring_spike_7d;
  if (signals.eng_hiring_14d) score += BONUSES.eng_hiring_14d;
  if (signals.churn_14d) score += BONUSES.churn_14d;
  if (signals.early_career_language) score += BONUSES.early_career_language;
  return Math.max(0, Math.min(100, score));
}
