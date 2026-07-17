/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OriginalFinding {
  id: string; // e.g. "JC-2026-001"
  date: string; // e.g. "2026-07-16"
  clinic: string; // e.g. "St. Jude Medical Center"
  department: string; // e.g. "Internal Medicine (4B)"
  description: string; // Verbatim surveyor finding description
  category?: string; // Optional raw category
  rowNumber?: number; // 1-indexed row number from CSV
}

export type HumanReviewStatus = 
  | "Review Not Required"
  | "Review Recommended"
  | "Review Required"
  | "Unable to Determine";

export interface StandardsClassification {
  primaryChapter: string; // e.g. "Medication Management (MM)"
  primaryStandard: string; // e.g. "MM.02.01.01"
  primaryEP: string; // e.g. "EP 1"
  epLanguage: string; // Verbatim EP text from JCI reference
  regulatoryRationale: string;
  confidenceScore: number; // 0 to 100
  humanReviewStatus: HumanReviewStatus;
  additionalInfoNeeded?: string;
  secondaryStandard?: string;
}

export type SurveyRiskLevel = "Low" | "Moderate" | "High" | "Unable to Determine";
export type SAFERMatrixPlacement = 
  | "Low/Limited" | "Low/Pattern" | "Low/Widespread"
  | "Moderate/Limited" | "Moderate/Pattern" | "Moderate/Widespread"
  | "High/Limited" | "High/Pattern" | "High/Widespread"
  | "Immediate Threat to Life"
  | "Unable to Determine";

export type TrendClassification = "Isolated" | "Repeat" | "Emerging" | "Established" | "Systemic";
export type ExecutivePriority = "Routine Monitoring" | "Department Review" | "Leadership Review" | "Executive Escalation" | "Immediate Action Required";
export type SurveyReadiness = "Survey Ready" | "Minor Improvement Needed" | "Moderate Improvement Needed" | "Significant Improvement Needed" | "Immediate Leadership Attention";

export interface RiskIntelligence {
  surveyRiskLevel: SurveyRiskLevel;
  saferMatrixPlacement: SAFERMatrixPlacement;
  scope: "Limited" | "Pattern" | "Widespread";
  trendClassification: TrendClassification;
  trendDomain: string; // e.g. "Clinical Environment", "Competency Verification", "Infection Control"
  executivePriority: ExecutivePriority;
  surveyReadiness: SurveyReadiness;
  executiveWatchList: boolean;
  surveyRiskRationale: string;
  humanReviewStatus: HumanReviewStatus;
}

export interface CorrectiveAction {
  immediateCorrectiveAction: string;
  contributingSystemFactors: string;
  improvementStrategy: string;
  interventionStrength: "Weak" | "Moderate" | "Strong";
  responsibleOwner: string;
  suggestedTimeline: string; // e.g. "Immediate", "30 Days", "60 Days"
  processMeasures: string;
  outcomeMeasures: string;
  sustainabilityStrategy: string;
  implementationComplexity: "Low" | "Moderate" | "High";
  executiveSponsorship: "Not Required" | "Recommended" | "Required";
  improvementRationale: string;
}

export interface MockSurveyFinding {
  id: string;
  original: OriginalFinding;
  classification?: StandardsClassification;
  riskIntelligence?: RiskIntelligence;
  correctiveAction?: CorrectiveAction;
  status: "Waiting" | "Processing" | "Complete" | "Needs Review";
  processedAt?: string;
}

export interface DatasetStats {
  totalFindings: number;
  completedAnalysis: number;
  needsReviewCount: number;
  highRiskCount: number;
  chapterDistribution: Record<string, number>;
  saferPlacementDistribution: Record<SAFERMatrixPlacement, number>;
  priorityDistribution: Record<ExecutivePriority, number>;
}
