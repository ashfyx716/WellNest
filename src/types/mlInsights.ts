export type RiskPrediction = {
  risk_level?: string;
  risk_score?: number;
  risk_label?: string;
  prediction_message?: string;
  alert_family?: boolean;
  top_risk_factors?: string[];
  recommendations?: string[];
};

export type TopicChip = {
  topic_id?: number;
  label: string;
  keywords?: string[];
  weight?: number;
  emoji?: string;
};

export type TopicInsightsPayload = {
  topics?: TopicChip[];
  dominant_topic?: TopicChip;
  insight_message?: string;
};

export type MlInsightsApi = {
  risk_prediction: RiskPrediction;
  topic_insights: TopicInsightsPayload;
  notes_logged_count?: number;
};

export type MomMlRiskApi = {
  showAlert: boolean;
  risk_prediction?: RiskPrediction;
  message?: string;
};

export type SaveEntryWithBert = {
  bertDetectedEmotion?: string | null;
  bertConfidence?: number | null;
  bertConflictsWithManual?: boolean | null;
  bertNestiMessage?: string | null;
};

export type BertResultPayload = {
  emotion?: string | null;
  confidence?: number | null;
  message?: string | null;
};

export type SaveCheckinApiResponse = {
  entry: SaveEntryWithBert;
  bert_result: BertResultPayload;
};
