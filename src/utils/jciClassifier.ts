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

// Heuristic keyword matcher to associate findings to authoritative Standards
export function runStandardsClassificationSpecialist(original: OriginalFinding): StandardsClassification {
  const desc = original.description.toLowerCase();
  
  let refKey = "";
  
  if (desc.includes("refrigerator") || desc.includes("vaccine") || desc.includes("expiration") || desc.includes("expire")) {
    refKey = "MM.03.01.01_EP2";
    if (desc.includes("expired") && !desc.includes("refrigerator")) {
      refKey = "MM.03.01.01_EP8";
    }
  } else if (desc.includes("high-alert") || desc.includes("hazardous medication") || desc.includes("hazardous drug")) {
    refKey = "MM.01.01.03_EP1";
  } else if (desc.includes("look-alike") || desc.includes("sound-alike") || desc.includes("lasa")) {
    refKey = "MM.01.02.01_EP1";
  } else if (desc.includes("label") && (desc.includes("syringe") || desc.includes("sterile field") || desc.includes("procedural"))) {
    refKey = "NPSG.03.04.01_EP1";
  } else if (desc.includes("label") && desc.includes("medication")) {
    refKey = "MM.05.01.09_EP1";
  } else if (desc.includes("credential") || desc.includes("primary source") || desc.includes("verification") || desc.includes("license")) {
    refKey = "HR.01.01.01_EP2";
  } else if (desc.includes("orientation") || desc.includes("new hire") || desc.includes("orient")) {
    refKey = "HR.01.04.01_EP3";
  } else if (desc.includes("competency") || desc.includes("skills check") || desc.includes("assess competence")) {
    refKey = "HR.01.06.01_EP6";
  } else if (desc.includes("exit") || desc.includes("blocked") || desc.includes("obstruction") || desc.includes("clutter")) {
    refKey = "LS.03.01.20_EP6";
  } else if (desc.includes("construction") || desc.includes("ilsm") || desc.includes("interim life safety")) {
    refKey = "LS.01.02.01_EP1";
  } else if (desc.includes("drill") && desc.includes("fire")) {
    refKey = "EC.02.03.03_EP1";
  } else if (desc.includes("hazard vulnerability") || desc.includes("hva")) {
    refKey = "EM.11.01.01_EP1";
  } else if (desc.includes("ventilation") || desc.includes("contaminant") || desc.includes("pressure relationship")) {
    refKey = "EC.02.05.01_EP7";
  } else if (desc.includes("standard precaution") || desc.includes("ppe") || desc.includes("mask") || desc.includes("glove")) {
    refKey = "IC.02.01.01_EP2";
  } else if (desc.includes("clean") || desc.includes("low-level") || desc.includes("wipe") || desc.includes("glucometer")) {
    refKey = "IC.02.02.01_EP1";
  } else if (desc.includes("sterilization") || desc.includes("reprocess") || desc.includes("high-level disinfection")) {
    refKey = "IC.02.02.01_EP2";
  } else if (desc.includes("hand hygiene") || desc.includes("handwash") || desc.includes("sanitizer")) {
    refKey = "NPSG.07.01.01_EP1";
  } else if (desc.includes("identifier") || desc.includes("wristband") || desc.includes("patient name")) {
    refKey = "NPSG.01.01.01_EP1";
  }

  if (refKey && standardsDatabase[refKey]) {
    const ref = standardsDatabase[refKey];
    return {
      primaryChapter: ref.chapter,
      primaryStandard: ref.standard,
      primaryEP: ref.ep,
      epLanguage: ref.epLanguage,
      regulatoryRationale: `The finding describes a gap directly governed by standard ${ref.standard} regarding ${ref.defaultTrendDomain}. Verbatim EP requirements specify that ${ref.epLanguage}`,
      confidenceScore: 95,
      humanReviewStatus: "Review Not Required"
    };
  }

  // Fallback if unable to determine standard cleanly
  return {
    primaryChapter: "Unable to Determine",
    primaryStandard: "Unable to Determine",
    primaryEP: "Unable to Determine",
    epLanguage: "No matching standard could be confidently mapped to this survey finding.",
    regulatoryRationale: "Uncertainty Reason: The surveyor description lacks specific keywords or context to identify JCI standard intent. Additional information needed: Operational details of clinic procedures, safety logs, and local workflows.",
    confidenceScore: 0,
    humanReviewStatus: "Unable to Determine",
    additionalInfoNeeded: "Detailed context regarding the exact equipment, clinician action, or environmental condition witnessed."
  };
}

export function runSurveyRiskIntelligenceSpecialist(
  original: OriginalFinding, 
  classification: StandardsClassification
): RiskIntelligence {
  const desc = original.description.toLowerCase();
  
  // Default values
  let riskLevel: SurveyRiskLevel = "Moderate";
  let placement: SAFERMatrixPlacement = "Moderate/Pattern";
  let scope: "Limited" | "Pattern" | "Widespread" = "Pattern";
  let trend: TrendClassification = "Emerging";
  let domain = "Clinical Environment";
  let priority: ExecutivePriority = "Department Review";
  let readiness: SurveyReadiness = "Minor Improvement Needed";
  let watchlist = false;

  // Derive domain from chapter if determined
  if (classification.primaryChapter !== "Unable to Determine") {
    if (classification.primaryChapter.includes("Medication")) domain = "Medication Safety";
    else if (classification.primaryChapter.includes("Environment")) domain = "Environment of Care";
    else if (classification.primaryChapter.includes("Infection")) domain = "Infection Control";
    else if (classification.primaryChapter.includes("Human")) domain = "Competency Verification";
    else if (classification.primaryChapter.includes("Safety") || classification.primaryChapter.includes("Life")) domain = "Life Safety";
    else domain = "Clinical Practice";
  }

  // Determine severity and scope from finding description keywords
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
    desc.includes("staff interviewed indicated a lack") || 
    desc.includes("entire") || 
    desc.includes("wing") || 
    desc.includes("systemic");

  const isLimited = 
    desc.includes("single") || 
    desc.includes("isolated") || 
    desc.includes("one instance") || 
    desc.includes("one vial") || 
    desc.includes("one employee");

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
    // Moderate or low
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

  // Handle unable to determine
  if (classification.primaryChapter === "Unable to Determine") {
    return {
      surveyRiskLevel: "Unable to Determine",
      saferMatrixPlacement: "Unable to Determine",
      scope: "Limited",
      trendClassification: "Emerging",
      trendDomain: "General Compliance",
      executivePriority: "Leadership Review",
      surveyReadiness: "Significant Improvement Needed",
      executiveWatchList: false,
      surveyRiskRationale: "Uncertainty Reason: The finding does not match any known JCI standard keywords or clinical domains in the database. Additional information needed: Detailed clinical description of standard violated.",
      humanReviewStatus: "Unable to Determine"
    };
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
  if (classification.primaryChapter === "Unable to Determine") {
    return {
      immediateCorrectiveAction: "No corrective action until human review.",
      contributingSystemFactors: "Uncertainty Reason: High-confidence root cause analysis is blocked due to ambiguous survey details.",
      improvementStrategy: "No corrective action until human review.",
      interventionStrength: "Weak",
      responsibleOwner: "Quality Assurance Committee",
      suggestedTimeline: "TBD",
      processMeasures: "None defined. Awaiting clinician assessment of appropriate monitoring metrics.",
      outcomeMeasures: "None defined. Awaiting clinician assessment of target safety goals.",
      sustainabilityStrategy: "None defined. Pending human verification of clinical standards.",
      implementationComplexity: "Moderate",
      executiveSponsorship: "Required",
      improvementRationale: "Uncertainty Reason: Action plan is deferred to prevent implementing inappropriate or redundant process changes based on an unverified finding."
    };
  }
  
  // Default values
  let immediate = "Conduct staff review and rectify immediate finding.";
  let factors = "Inconsistent tracking procedures and lack of supervisory audits.";
  let strategy = "Establish standardized monitoring checklists and train team.";
  let strength: "Weak" | "Moderate" | "Strong" = "Moderate";
  let owner = "Department Manager";
  let timeline = "30 Days";
  let processM = "Percent of logs completed weekly.";
  let outcomeM = "Zero instances of reoccurrence in audits.";
  let sustainability = "Incorporate monthly safety walks and peer audits.";
  let complexity: "Low" | "Moderate" | "High" = "Moderate";
  let sponsorship: "Not Required" | "Recommended" | "Required" = "Recommended";

  const standard = classification.primaryStandard;

  // Custom standard plans
  if (standard === "MM.03.01.01") {
    immediate = "Remove all expired medications and document destruction. Log refrigerator temperatures immediately.";
    factors = "Absence of automated temperature alerts, manual logging omissions over weekends, and lack of visual expiration checklists.";
    strategy = "Implement automatic Wi-Fi enabled temperature sensors with central SMS alerts. Adopt color-coded expiration stickers for medicines.";
    strength = "Strong";
    owner = "Nurse Manager & Pharmacist In Charge";
    timeline = "Immediate (7 Days)";
    processM = "Wi-Fi sensor uptime and daily manual backup log compliance rates.";
    outcomeM = "Medication refrigerator temperature out-of-range events = 0. Zero expired drugs found in inventory audits.";
    sustainability = "Mandate weekly pharmacy audits of clinic medicine inventory. Establish monthly temperature exception reports for Leadership.";
    complexity = "Moderate";
    sponsorship = "Required";
  } 
  else if (standard === "MM.01.01.03") {
    immediate = "Formally sign off on a list of High-Alert drugs and place physical visual warnings on bins.";
    factors = "Undocumented clinical protocols and lack of specialized training on high-risk infusions.";
    strategy = "Create a master High-Alert medication list integrated into the EMR prescribing screens with required dual-clinician signoffs.";
    strength = "Strong";
    owner = "Clinical Pharmacist";
    timeline = "30 Days";
    processM = "Percentage of high-alert drug orders containing required double-checks.";
    outcomeM = "Zero patient safety sentinel events involving high-alert medications.";
    sustainability = "Quarterly Pharmacy and Therapeutics Committee review of high-alert medication events.";
    complexity = "High";
    sponsorship = "Required";
  }
  else if (standard === "HR.01.01.01") {
    immediate = "Verify credentials and licensing of affected clinician directly with state licensing board database.";
    factors = "Inadequate HR credential tracking procedures, reliance on employee-submitted copies, and lack of automatic expiration reminders.";
    strategy = "Adopt a cloud-based primary source verification software that syncs with licensing boards and flags licenses expiring in 90 days.";
    strength = "Strong";
    owner = "HR Credentialing Specialist";
    timeline = "14 Days";
    processM = "Percentage of licensed employees audited through primary source board queries.";
    outcomeM = "100% of staff verified via primary source board verification prior to hire date.";
    sustainability = "Quarterly HR compliance reports delivered directly to the Governing Body.";
    complexity = "Moderate";
    sponsorship = "Required";
  }
  else if (standard === "LS.03.01.20") {
    immediate = "Clear all exit obstructions immediately. Ensure doorways swing freely and are completely unblocked.";
    factors = "Inadequate staging space for clinical carts, lack of clear responsibility for hallway safety, and lack of physical space audits.";
    strategy = "Establish marked 'No Parking' zones in corridors for clinical carts. Complete daily safety walks with shift-lead checklist logs.";
    strength = "Strong";
    owner = "Facilities Safety Lead";
    timeline = "Immediate (1 Day)";
    processM = "Compliance rate of safety walks completed on morning and evening shifts.";
    outcomeM = "Hallways 100% clear of obstruction during unannounced safety audits.";
    sustainability = "Include hallway safety compliance in standard nurse handoff shift reports.";
    complexity = "Low";
    sponsorship = "Recommended";
  }
  else if (standard === "IC.02.02.01") {
    immediate = "Re-sanitize/sterilize reprocessing units. Retrain technicians on instrument pre-cleaning steps.";
    factors = "High employee turnover in sterile processing, lack of sterilizer cycle documentation, and lack of visual reprocessing aides.";
    strategy = "Install electronic sterilizer tracking systems. Establish a double-signature reprocessing checklist for each tray.";
    strength = "Strong";
    owner = "Sterile Processing Director";
    timeline = "30 Days";
    processM = "Percent of autoclave cycles matched to biological indicator results.";
    outcomeM = "Zero positive biological indicator tests on released surgical trays.";
    sustainability = "Mandate annual competence checkoffs for all sterile reprocessing staff.";
    complexity = "High";
    sponsorship = "Required";
  }
  else if (standard === "NPSG.07.01.01") {
    immediate = "Replenish hand gel stations. Provide just-in-time hand washing education to clinical staff.";
    factors = "Lack of hand sanitizer dispensers in patient rooms, and absence of peer compliance coaching.";
    strategy = "Implement anonymous hand hygiene 'secret shopper' audits. Increase wall-mounted sanitizer dispensers by 50%.";
    strength = "Moderate";
    owner = "Clinic Operations Manager";
    timeline = "30 Days";
    processM = "Hand wash compliance scores during random peer observations.";
    outcomeM = "Hand hygiene compliance rate reaches and sustains >95%.";
    sustainability = "Publish monthly clinic-level compliance rates on staff boards to drive team competition.";
    complexity = "Low";
    sponsorship = "Not Required";
  }

  // Adjust complexity & sponsorship based on risk
  if (riskIntel.surveyRiskLevel === "High") {
    complexity = complexity === "Low" ? "Moderate" : complexity;
    sponsorship = "Required";
  }

  return {
    immediateCorrectiveAction: immediate,
    contributingSystemFactors: factors,
    improvementStrategy: strategy,
    interventionStrength: strength,
    responsibleOwner: owner,
    suggestedTimeline: timeline,
    processMeasures: processM,
    outcomeMeasures: outcomeM,
    sustainabilityStrategy: sustainability,
    implementationComplexity: complexity,
    executiveSponsorship: sponsorship,
    improvementRationale: `Prioritizing system-level improvements over human education. The corrective action relies on systemic engineering controls (${strategy}) to create a fail-safe process, as education alone is a weak intervention.`
  };
}

export function runFullPipeline(raw: OriginalFinding): MockSurveyFinding {
  // 1. Run Standards Classification Specialist
  const classification = runStandardsClassificationSpecialist(raw);
  
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

