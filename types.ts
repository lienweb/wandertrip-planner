export interface TripFormData {
  destination: string;
  travelers: number;
  ageRange: string;
  duration: number;
  dateRange?: string;
  budget: string;
  preferences: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AppState {
  INPUT = 'INPUT',
  LOADING = 'LOADING',
  PLAN_VIEW = 'PLAN_VIEW',
}

export type RefinementOption = 'A' | 'B' | 'C' | 'D' | 'E';

export const REFINEMENT_LABELS: Record<RefinementOption, string> = {
  A: 'Reduce cost',
  B: 'Slow the pace',
  C: 'More local/cultural experiences',
  D: 'Add must-see highlights',
  E: 'Rebalance for a specific traveler',
};