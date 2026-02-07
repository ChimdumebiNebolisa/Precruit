export interface CompanyInput {
  slug: string;
  name: string;
  hiring_spike_7d: boolean;
  eng_hiring_14d: boolean;
  churn_14d: boolean;
  early_career_language: boolean;
}

export interface CompanyApiItem {
  slug: string;
  name: string;
  probability: number;
  traffic_light: string;
  neutral_explanation: string;
  ai_reason: string;
}
