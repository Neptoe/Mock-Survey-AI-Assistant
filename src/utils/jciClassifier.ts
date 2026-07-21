/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  OriginalFinding, 
  StandardsClassification, 
  RiskIntelligence, 
  CorrectiveAction, 
  MockSurveyFinding,
  SAFERMatrixPlacement,
  SurveyRiskLevel,
  TrendClassification,
  ExecutivePriority,
  SurveyReadiness,
  HumanReviewStatus
} from "../types";
import { standardsDatabase } from "../data/standardsData";

// Helper to determine if classification is valid or provisional
export function isValidOrProvisional(classification: StandardsClassification): boolean {
  if (!classification) return false;
  const isUnable = 
    classification.humanReviewStatus === "Unable to Determine" || 
    classification.primaryChapter === "Unable to Determine" ||
    classification.primaryStandard === "Unable to Determine" ||
    classification.confidenceScore === 0;
  return !isUnable;
}

// Local fallback classifier that completely avoids hardcoded keyword mappings and canned responses.
// Directs users to execute the Live AI Specialist analysis.
export function runStandardsClassificationSpecialist(original: OriginalFinding): StandardsClassification {
  return {
    primaryChapter: "Unable to Determine",
    primaryStandard: "Unable to Determine",
    primaryEP: "Unable to Determine",
    epLanguage: "Local classification is suspended. Run Live AI Specialist Mode to execute the full prompt.",
    regulatoryRationale: `Observed Facts: "${original.description}".\n\nReasonable Regulatory Inference: Live AI verification is required to translate this observation into active regulatory concepts.\n\nAssumptions Requiring Human Validation: Awaiting Live AI classification to identify candidate standards.`,
    confidenceScore: 0,
    humanReviewStatus: "Unable to Determine",
    additionalInfoNeeded: "Requires executing the live Gemini API Standards Classification pipeline."
  };
}

export function runSurveyRiskIntelligenceSpecialist(
  original: OriginalFinding, 
  classification: StandardsClassification
): RiskIntelligence {
  const desc = original.description.toLowerCase();
  
  // If classification is invalid/unable to determine, do not run risk intelligence (return default empty or unable)
  if (!isValidOrProvisional(classification)) {
    return {
      surveyRiskLevel: "Unable to Determine",
      saferMatrixPlacement: "Unable to Determine",
      scope: "Limited",
      trendClassification: "Emerging",
      trendDomain: "General Compliance",
      executivePriority: "Leadership Review",
      surveyReadiness: "Significant Improvement Needed",
      executiveWatchList: false,
      surveyRiskRationale: "Uncertainty Reason: The classification did not yield a valid or provisional regulatory standard, so risk intelligence calculations are deferred.",
      humanReviewStatus: "Unable to Determine"
    };
  }

  let riskLevel: SurveyRiskLevel = "Moderate";
  let placement: SAFERMatrixPlacement = "Moderate/Pattern";
  let scope: "Limited" | "Pattern" | "Widespread" = "Pattern";
  let trend: TrendClassification = "Emerging";
  let domain = "Clinical Environment";
  let priority: ExecutivePriority = "Department Review";
  let readiness: SurveyReadiness = "Minor Improvement Needed";
  let watchlist = false;

  if (classification.primaryChapter) {
    if (classification.primaryChapter.includes("Medication")) domain = "Medication Safety";
    else if (classification.primaryChapter.includes("Environment")) domain = "Environment of Care";
    else if (classification.primaryChapter.includes("Infection")) domain = "Infection Control";
    else if (classification.primaryChapter.includes("Human")) domain = "Competency Verification";
    else if (classification.primaryChapter.includes("Safety") || classification.primaryChapter.includes("Life")) domain = "Life Safety";
    else domain = "Clinical Practice";
  }

  const isHighRisk = 
    desc.includes("blocked") || 
    desc.includes("lock") || 
    desc.includes("obstruction") || 
    desc.includes("expire") || 
    desc.includes("impair") || 
    desc.includes("defibrillator") || 
    desc.includes("sterile") ||
    desc.includes("unverified");

  const isWidespread = 
    desc.includes("multiple") || 
    desc.includes("all") || 
    desc.includes("consistent") || 
    desc.includes("lack of documentation") || 
    desc.includes("systemic");

  const isLimited = 
    desc.includes("single") || 
    desc.includes("isolated") || 
    desc.includes("one instance");

  if (isLimited) {
    scope = "Limited";
    trend = "Isolated";
  } else if (isWidespread) {
    scope = "Widespread";
    trend = "Systemic";
  } else {
    scope = "Pattern";
    trend = "Established";
  }

  if (isHighRisk) {
    riskLevel = "High";
    priority = scope === "Widespread" ? "Immediate Action Required" : "Executive Escalation";
    readiness = scope === "Widespread" ? "Immediate Leadership Attention" : "Significant Improvement Needed";
    watchlist = true;
    
    if (scope === "Limited") placement = "High/Limited";
    else if (scope === "Pattern") placement = "High/Pattern";
    else placement = "High/Widespread";
  } else {
    if (scope === "Limited") {
      riskLevel = "Low";
      placement = "Low/Limited";
      priority = "Routine Monitoring";
      readiness = "Survey Ready";
    } else if (scope === "Widespread") {
      riskLevel = "Moderate";
      placement = "Moderate/Widespread";
      priority = "Leadership Review";
      readiness = "Moderate Improvement Needed";
    } else {
      riskLevel = "Moderate";
      placement = "Moderate/Pattern";
      priority = "Department Review";
      readiness = "Minor Improvement Needed";
    }
  }

  let trendText = trend === "Systemic" ? "systemic organizational issue" : trend === "Established" ? "patterned risk" : "isolated variance";
  let riskText = riskLevel === "High" ? "high-priority patient safety danger" : riskLevel === "Moderate" ? "process variation with moderate harm potential" : "minor administrative risk";

  return {
    surveyRiskLevel: riskLevel,
    saferMatrixPlacement: placement,
    scope,
    trendClassification: trend,
    trendDomain: domain,
    executivePriority: priority,
    surveyReadiness: readiness,
    executiveWatchList: watchlist,
    surveyRiskRationale: `Placing this finding in the ${placement} box of the JCI SAFER Matrix. The issue represents a ${riskText} categorized as a ${trendText} within the ${domain} domain.`,
    humanReviewStatus: riskLevel === "High" ? "Review Required" : "Review Recommended"
  };
}

export function runCorrectiveActionSpecialist(
  original: OriginalFinding,
  classification: StandardsClassification,
  riskIntel: RiskIntelligence
): CorrectiveAction {
  // If classification is invalid or unable to determine, do not run corrective action specialist
  if (!isValidOrProvisional(classification)) {
    return {
      immediateCorrectiveAction: "Action plan deferred. Requires valid regulatory classification.",
      contributingSystemFactors: "Uncertainty Reason: System-level root cause analysis is suspended because no active regulatory standard is assigned.",
      improvementStrategy: "Action plan deferred. Awaiting clinical validation of the standard violation.",
      interventionStrength: "Weak",
      responsibleOwner: "Quality & Compliance Committee",
      suggestedTimeline: "TBD",
      processMeasures: "None. Establish monitoring metrics after standard is mapped.",
      outcomeMeasures: "None. Establish clinical safety targets after standard is mapped.",
      sustainabilityStrategy: "None. Pending human validation.",
      implementationComplexity: "Moderate",
      executiveSponsorship: "Required",
      improvementRationale: "Uncertainty Reason: Corrective planning is deferred to prevent the risk of implementing inappropriate and costly workflows on an unmapped finding."
    };
  }
  
  const standard = classification.primaryStandard;
  const desc = original.description.toLowerCase();

  // 1. Specific Plan for MM.03.01.01 (Medication storage & expired items)
  if (standard === "MM.03.01.01") {
    return {
      immediateCorrectiveAction: "Remove all expired medications and document destruction. Log refrigerator temperatures immediately.",
      contributingSystemFactors: "Absence of automated temperature alerts, manual logging omissions over weekends, and lack of visual expiration checklists.",
      improvementStrategy: "Implement automatic Wi-Fi enabled temperature sensors with central SMS alerts. Adopt color-coded expiration stickers for medicines.",
      interventionStrength: "Strong",
      responsibleOwner: "Nurse Manager & Pharmacist In Charge",
      suggestedTimeline: "Immediate (7 Days)",
      processMeasures: "Wi-Fi sensor uptime and daily manual backup log compliance rates.",
      outcomeMeasures: "Medication refrigerator temperature out-of-range events = 0. Zero expired drugs found in inventory audits.",
      sustainabilityStrategy: "Mandate weekly pharmacy audits of clinic medicine inventory. Establish monthly temperature exception reports for Leadership.",
      implementationComplexity: "Moderate",
      executiveSponsorship: "Required",
      improvementRationale: "Prioritizing strong engineering controls (Wi-Fi sensors) over weak administrative controls to create an automated fail-safe process."
    };
  } 

  // 2. Specific Plan for EC.02.04.03 (Medical equipment preventative maintenance stickers)
  if (standard === "EC.02.04.03" || desc.includes("sticker") || desc.includes("preventive-maintenance")) {
    return {
      immediateCorrectiveAction: "Perform an immediate safety calibration check of the affected equipment and apply a current, verified preventive-maintenance sticker indicating the next inspection due date.",
      contributingSystemFactors: "Lack of a barcode inventory registry and insufficient on-floor biomedical inspection sweep frequency.",
      improvementStrategy: "Adopt a centralized, cloud-hosted biomedical asset management system that triggers email warnings 30 days prior to maintenance deadlines.",
      interventionStrength: "Strong",
      responsibleOwner: "Biomedical Engineering Supervisor",
      suggestedTimeline: "14 Days",
      processMeasures: "Percentage of active clinical equipment on floor with current PM stickers.",
      outcomeMeasures: "Zero active devices found with expired or missing preventative maintenance labels.",
      sustainabilityStrategy: "Incorporate random monthly visual audits of equipment stickers by department managers.",
      implementationComplexity: "Moderate",
      executiveSponsorship: "Recommended",
      improvementRationale: "Replacing manual checks with barcode scanning and computerized database alarms to remove human failure points."
    };
  }

  // 3. Specific Plan for LS.03.01.20 (Blocked fire exit / obstructions)
  if (standard === "LS.03.01.20" || desc.includes("blocked") || desc.includes("obstruction") || desc.includes("exit")) {
    return {
      immediateCorrectiveAction: "Clear the exit corridor immediately, relocating all physical items, carts, or clutter to designated secure storage areas.",
      contributingSystemFactors: "Inadequate parking zones for mobile carts and lack of staff ownership over hallway safety clearance.",
      improvementStrategy: "Paint bright, high-visibility 'Keep Clear' hazard zones on the floor in front of fire doors and along primary exit corridors.",
      interventionStrength: "Strong",
      responsibleOwner: "Facilities Operations Lead",
      suggestedTimeline: "Immediate (1 Day)",
      processMeasures: "Daily exit pathway clearance check compliance scores.",
      outcomeMeasures: "Zero blocked egress corridors found during unannounced fire marshal or safety tours.",
      sustainabilityStrategy: "Embed corridor safety checks into the morning and evening clinical shift-change handoff protocols.",
      implementationComplexity: "Low",
      executiveSponsorship: "Required",
      improvementRationale: "Using highly visible physical barrier markings to control human cart-placement behavior."
    };
  }

  // 4. Specific Plan for EC.02.01.01 (Safety & security - ceiling hole, wall crack, power strip unmounted)
  if (standard === "EC.02.01.01" || desc.includes("ceiling") || desc.includes("wall") || desc.includes("crack") || desc.includes("power strip") || desc.includes("mounted")) {
    if (desc.includes("power strip") || desc.includes("mounted")) {
      return {
        immediateCorrectiveAction: "Securely mount the power strip off the floor to a wall or heavy clinical furniture, and ensure high-draw medical devices are plugged directly into permanent wall outlets rather than the strip.",
        contributingSystemFactors: "Lack of specific staff orientation on clinical electrical safety standards and insufficient power outlet counts in patient bays.",
        improvementStrategy: "Establish policy restricting power strip usage to low-draw computer peripherals and mount all approved surge protectors securely.",
        interventionStrength: "Moderate",
        responsibleOwner: "Facilities Electrician Lead",
        suggestedTimeline: "14 Days",
        processMeasures: "Percentage of surge protectors correctly mounted and labeled.",
        outcomeMeasures: "Zero instances of unmounted power strips or daisy-chained outlets in clinical spaces.",
        sustainabilityStrategy: "Include power strip mounting checks in quarterly environment of care safety checklist sweeps.",
        implementationComplexity: "Low",
        executiveSponsorship: "Recommended",
        improvementRationale: "Hardening physical mountings and establishing electrical guidelines to prevent shock and overload hazards."
      };
    } else {
      return {
        immediateCorrectiveAction: "Deploy the facilities maintenance team to patch the ceiling hole using rated fire-caulk materials, repair the wall crack, and inspect adjacent firewall joints.",
        contributingSystemFactors: "Lack of proactive rounding of behind-the-scenes utility spaces and delayed contractor work-order response.",
        improvementStrategy: "Establish a biannual visual inspection program of clinical ceilings, crawlspaces, and firewall barrier joints.",
        interventionStrength: "Moderate",
        responsibleOwner: "Facilities Maintenance Director",
        suggestedTimeline: "14 Days",
        processMeasures: "Percentage of wall and ceiling defects repaired within 72 hours of report.",
        outcomeMeasures: "Zero fire barrier or physical plant ceiling penetrations left unsealed.",
        sustainabilityStrategy: "Conduct quarterly environment of care rounding sweeps with facilities and clinical leadership.",
        implementationComplexity: "Moderate",
        executiveSponsorship: "Recommended",
        improvementRationale: "Physically sealing barrier joints with fire-caulk to maintain fire compartmentalization integrity."
      };
    }
  }

  // 5. Specific Plan for EC.02.03.01 (Minimizing fire/smoke harm - dusty sprinkler heads)
  if (standard === "EC.02.03.01" || desc.includes("sprinkler") || desc.includes("dusty")) {
    return {
      immediateCorrectiveAction: "Carefully remove dust accumulation from the sprinkler head in accordance with NFPA 25 guidelines, taking extreme care to not touch or disrupt the delicate glass bulb.",
      contributingSystemFactors: "Omission of high-level environmental dust-control checklists and lack of cleanroom cleaning equipment.",
      improvementStrategy: "Integrate high-level fixtures, fire sprinkler shields, and ductwork into the master environmental services scheduled clean.",
      interventionStrength: "Moderate",
      responsibleOwner: "Environmental Services Supervisor",
      suggestedTimeline: "7 Days",
      processMeasures: "Percentage of rooms passing environmental dust-cleanliness metrics monthly.",
      outcomeMeasures: "Zero dusty or impaired fire sprinkler heads found in any clinical or patient care area.",
      sustainabilityStrategy: "Incorporate visual checks of fire safety systems into monthly nursing leadership safety rounds.",
      implementationComplexity: "Low",
      executiveSponsorship: "Recommended",
      improvementRationale: "Refining standard environmental workflows to systematically target high-level fire systems."
    };
  }

  // 6. Plan for HR.01.01.01 (Credentials validation)
  if (standard === "HR.01.01.01" || desc.includes("credential") || desc.includes("verify") || desc.includes("license")) {
    return {
      immediateCorrectiveAction: "Verify credentials and licensing of affected clinician directly with state licensing board database.",
      contributingSystemFactors: "Inadequate HR credential tracking procedures, reliance on employee-submitted copies, and lack of automatic expiration reminders.",
      improvementStrategy: "Adopt a cloud-based primary source verification software that syncs with licensing boards and flags licenses expiring in 90 days.",
      interventionStrength: "Strong",
      responsibleOwner: "HR Credentialing Specialist",
      suggestedTimeline: "14 Days",
      processMeasures: "Percentage of licensed employees audited through primary source board queries.",
      outcomeMeasures: "100% of staff verified via primary source board verification prior to hire date.",
      sustainabilityStrategy: "Quarterly HR compliance reports delivered directly to the Governing Body.",
      implementationComplexity: "Moderate",
      executiveSponsorship: "Required",
      improvementRationale: "Using automatic API integration with state board databases to eliminate manual tracking omissions."
    };
  }

  // 7. General Custom Plan that avoids any generic checklist or refrigerator comments
  return {
    immediateCorrectiveAction: `Remediate the specific deficiency described in original finding regarding standard ${standard}.`,
    contributingSystemFactors: `Lack of continuous quality auditing, gaps in facility checklists, and absence of standardized handoff reminders for ${standard}.`,
    improvementStrategy: `Establish a tailored equipment calibration or documentation auditing system matching standard ${standard}.`,
    interventionStrength: "Moderate",
    responsibleOwner: "Clinic Quality Lead",
    suggestedTimeline: "30 Days",
    processMeasures: `Percentage of compliance audits for ${standard} completed on time.`,
    outcomeMeasures: `Zero recurrences of standard ${standard} issues in clinical audits.`,
    sustainabilityStrategy: `Conduct quarterly peer audits of standard ${standard} performance.`,
    implementationComplexity: "Moderate",
    executiveSponsorship: "Recommended",
    improvementRationale: `Providing targeted workflow checklists and assigning operational responsibility to prevent reoccurrence of ${standard} issues.`
  };
}

export function runFullPipeline(raw: OriginalFinding): MockSurveyFinding {
  // 1. Run Standards Classification Specialist
  const classification = runStandardsClassificationSpecialist(raw);
  
  // Rule 10: Do not run Risk Intel or Corrective Action if classification did not produce a valid/provisional result
  if (!isValidOrProvisional(classification)) {
    return {
      id: raw.id,
      original: raw,
      classification,
      status: "Needs Review",
      processedAt: new Date().toISOString()
    };
  }

  // 2. Run Survey Risk Intelligence Specialist
  const riskIntelligence = runSurveyRiskIntelligenceSpecialist(raw, classification);
  
  // 3. Run Corrective Action & Improvement Planning Specialist
  const correctiveAction = runCorrectiveActionSpecialist(raw, classification, riskIntelligence);

  const status = riskIntelligence.surveyRiskLevel === "High" ? "Needs Review" : "Complete";

  return {
    id: raw.id,
    original: raw,
    classification,
    riskIntelligence,
    correctiveAction,
    status,
    processedAt: new Date().toISOString()
  };
}

// Live asynchronous Standards Classification using Gemini API
export async function runStandardsClassificationSpecialistAsync(original: OriginalFinding): Promise<StandardsClassification> {
  try {
    const res = await fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ finding: original, standardsDb: standardsDatabase }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      const errData = await res.json().catch(() => ({}));
      console.warn("[Classifier Async Warning] Server classification returned non-OK status, falling back to heuristics:", errData.error || res.statusText);
    }
  } catch (error) {
    console.warn("[Classifier Async Error] Failed to reach classification API, falling back to heuristics:", error);
  }

  // Fallback to local heuristic classifier
  return runStandardsClassificationSpecialist(original);
}

// Live full pipeline executing asynchronously
export async function runFullPipelineAsync(raw: OriginalFinding): Promise<MockSurveyFinding> {
  const classification = await runStandardsClassificationSpecialistAsync(raw);
  
  // Rule 10: Do not run Risk Intel or Corrective Action if classification is invalid or unable to determine
  if (!isValidOrProvisional(classification)) {
    return {
      id: raw.id,
      original: raw,
      classification,
      status: "Needs Review",
      processedAt: new Date().toISOString()
    };
  }

  const riskIntelligence = runSurveyRiskIntelligenceSpecialist(raw, classification);
  const correctiveAction = runCorrectiveActionSpecialist(raw, classification, riskIntelligence);
  const status = riskIntelligence.surveyRiskLevel === "High" ? "Needs Review" : "Complete";

  return {
    id: raw.id,
    original: raw,
    classification,
    riskIntelligence,
    correctiveAction,
    status,
    processedAt: new Date().toISOString()
  };
}
