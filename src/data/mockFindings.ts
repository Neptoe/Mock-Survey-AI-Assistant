/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MockSurveyFinding, OriginalFinding } from "../types";
import { runFullPipeline } from "../utils/jciClassifier";

export const initialRawFindings: OriginalFinding[] = [
  {
    id: "JC-2023-042",
    date: "2023-10-24",
    clinic: "St. Jude Medical Center",
    department: "Internal Medicine (4B)",
    description: "During the environmental tour of Unit 4B, the medication refrigerator was inspected. Several vials of Influenza vaccines were found with expiration dates ranging from August 2023 to September 2023. Staff interviewed indicated a lack of consistent temperature logging over the previous weekend."
  },
  {
    id: "JC-2026-015",
    date: "2026-04-12",
    clinic: "Hope Ambulatory Center",
    department: "Day Surgery Suite Corridor",
    description: "Two large medical supply carts and a broken patient stretcher were observed parked in the main egress corridor of the Day Surgery Suite. This obstruction narrowed the exit corridor path to approximately 28 inches, violating clear path safety parameters."
  },
  {
    id: "JC-2026-024",
    date: "2026-06-03",
    clinic: "St. Jude Medical Center",
    department: "HR / Medical Staff Office",
    description: "During a review of personnel files, two active nurse practitioner files lacked evidence of direct primary source verification of state licensure at the time of their biennial privilege renewals. Only paper photocopies provided by the employees were present in the records."
  },
  {
    id: "JC-2026-033",
    date: "2026-02-18",
    clinic: "Mercy Family Care Clinic",
    department: "Pediatrics Outpatient Desk",
    description: "Observed 10 patient room entry sequences across 4 clinicians. In 4 of 10 instances, clinicians failed to sanitize hands immediately upon entry into the pediatric examination rooms, violating standard hand precautions. Two hand sanitizer wall dispensers in the hallway were found completely empty."
  },
  {
    id: "JC-2026-041",
    date: "2026-07-05",
    clinic: "Hope Ambulatory Center",
    department: "Minor Procedures Room 1",
    description: "On the sterile tray prepared for a minor excisional procedure, two pre-filled syringes containing clear fluid (lidocaine 1% and sterile saline) were observed completely unlabeled. The physician was currently gowning and the syringes were not in his direct, immediate control."
  }
];

export function getInitialAnalyzedFindings(): MockSurveyFinding[] {
  // Started as empty array per user request to remove hard-coded sample findings from production.
  return [];
}
