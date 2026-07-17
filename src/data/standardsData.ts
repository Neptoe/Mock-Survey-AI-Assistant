/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StandardReference {
  chapter: string;
  standard: string;
  ep: string;
  epLanguage: string;
  rationale: string;
  defaultTrendDomain: string;
  defaultOwner: string;
}

export const standardsDatabase: Record<string, StandardReference> = {
  // Medication Management (MM)
  "MM.03.01.01_EP2": {
    chapter: "Medication Management (MM)",
    standard: "MM.03.01.01",
    ep: "EP 2",
    epLanguage: "The organization stores medications according to the manufacturers' recommendations. This includes ensuring expiration dates are monitored and items are removed prior to use.",
    rationale: "Proper storage maintains medication integrity, prevents degradation, and reduces clinical errors related to spoiled or expired drugs.",
    defaultTrendDomain: "Medication Safety",
    defaultOwner: "Nurse Manager"
  },
  "MM.01.01.03_EP1": {
    chapter: "Medication Management (MM)",
    standard: "MM.01.01.03",
    ep: "EP 1",
    epLanguage: "The organization identifies, in writing, its high-alert and hazardous medications. High-alert medications are those that bear a heightened risk of causing significant patient harm when used in error.",
    rationale: "Failing to document high-alert drugs increases the probability of critical medication mix-ups and serious adverse sentinel events.",
    defaultTrendDomain: "Medication Safety",
    defaultOwner: "Pharmacy Director"
  },
  "MM.01.02.01_EP1": {
    chapter: "Medication Management (MM)",
    standard: "MM.01.02.01",
    ep: "EP 1",
    epLanguage: "The organization develops a list of look-alike/sound-alike (LASA) medications it stores, dispenses, or administers, and takes action to prevent errors involving their interchange.",
    rationale: "LASA drugs require physical separation, auxiliary labels, or tall-man lettering to reduce human selection errors.",
    defaultTrendDomain: "Clinical Environment",
    defaultOwner: "Pharmacy Supervisor"
  },
  "MM.03.01.01_EP8": {
    chapter: "Medication Management (MM)",
    standard: "MM.03.01.01",
    ep: "EP 8",
    epLanguage: "The organization removes all expired, damaged, and/or contaminated medications and stores them separately from medications available for administration.",
    rationale: "Expired or damaged vaccines, injectables, or pills must be completely sequestered to ensure they are never inadvertently administered to a patient.",
    defaultTrendDomain: "Medication Safety",
    defaultOwner: "Nurse Manager"
  },
  "MM.05.01.09_EP1": {
    chapter: "Medication Management (MM)",
    standard: "MM.05.01.09",
    ep: "EP 1",
    epLanguage: "Medication containers are labeled whenever medications are prepared but not immediately administered. Labels include drug name, strength, expiration date, and time.",
    rationale: "Unlabeled syringes on counters are a high-risk point for immediate injection errors of incorrect doses or agents.",
    defaultTrendDomain: "Infection Control",
    defaultOwner: "Clinical Supervisor"
  },

  // Environment of Care (EC)
  "EC.02.01.01_EP1": {
    chapter: "Environment of Care (EC)",
    standard: "EC.02.01.01",
    ep: "EP 1",
    epLanguage: "The organization implements its process to identify safety and security risks associated with the environment of care that could affect patients, staff, and visitors.",
    rationale: "Proactive environmental risk assessments must be active to identify physical building, access control, and workspace security vulnerabilities.",
    defaultTrendDomain: "Environment of Care",
    defaultOwner: "Safety Officer"
  },
  "EC.02.01.01_EP3": {
    chapter: "Environment of Care (EC)",
    standard: "EC.02.01.01",
    ep: "EP 3",
    epLanguage: "The organization takes action to minimize identified safety and security risks in the physical environment.",
    rationale: "Identified security or environmental safety hazards must have documented, immediate, and systemic interventions to prevent occupant harm.",
    defaultTrendDomain: "Environment of Care",
    defaultOwner: "Facilities Director"
  },
  "EC.02.02.01_EP1": {
    chapter: "Environment of Care (EC)",
    standard: "EC.02.02.01",
    ep: "EP 1",
    epLanguage: "The organization maintains a written, current inventory of hazardous materials and waste that it uses, stores, or generates (addressed by law and regulation).",
    rationale: "A comprehensive MSDS/SDS safety data sheet book and a matching current hazardous chemical ledger must be available to prevent toxic exposure.",
    defaultTrendDomain: "Hazardous Materials",
    defaultOwner: "Facilities Supervisor"
  },
  "EC.02.02.01_EP3": {
    chapter: "Environment of Care (EC)",
    standard: "EC.02.02.01",
    ep: "EP 3",
    epLanguage: "The organization has written procedures, including the use of precautions and personal protective equipment (PPE), to follow in response to hazardous material and waste spills or exposures.",
    rationale: "Staff must have immediate access to spill kits and documented spill protocols to contain exposures and chemical releases.",
    defaultTrendDomain: "Hazardous Materials",
    defaultOwner: "Facilities Supervisor"
  },
  "EC.02.03.01_EP1": {
    chapter: "Environment of Care (EC)",
    standard: "EC.02.03.01",
    ep: "EP 1",
    epLanguage: "The organization minimizes the potential for harm from fire, smoke, and other products of combustion. Fire exits, doors, and compartmentalization must be checked.",
    rationale: "Fire barriers, self-closing fire doors, and unobstructed corridors are crucial to maintaining safety and containing smoke in a fire emergency.",
    defaultTrendDomain: "Life Safety",
    defaultOwner: "Safety Officer"
  },
  "EC.02.03.03_EP1": {
    chapter: "Environment of Care (EC)",
    standard: "EC.02.03.03",
    ep: "EP 1",
    epLanguage: "The organization conducts quarterly fire drills in each building defined as an ambulatory health care occupancy by the Life Safety Code.",
    rationale: "Regular unannounced drills ensure staff are familiar with the fire response plan, alarms, pull-stations, and evacuation paths.",
    defaultTrendDomain: "Life Safety",
    defaultOwner: "Facilities Manager"
  },
  "EC.02.04.03_EP2": {
    chapter: "Environment of Care (EC)",
    standard: "EC.02.04.03",
    ep: "EP 2",
    epLanguage: "The organization inspects, tests, and maintains all high-risk medical equipment (including life-support equipment) on the medical equipment inventory.",
    rationale: "Defibrillators, ventilators, and emergency monitors require documented preventative maintenance (PM) to ensure they work in a crisis.",
    defaultTrendDomain: "Medical Equipment",
    defaultOwner: "Biomedical Engineer"
  },
  "EC.02.05.01_EP7": {
    chapter: "Environment of Care (EC)",
    standard: "EC.02.05.01",
    ep: "EP 7",
    epLanguage: "In areas designed to control airborne contaminants (operating rooms, sterile supply), the ventilation system provides appropriate pressure relationships, air-exchange rates, filtration efficiencies, humidity, and temperature.",
    rationale: "Negative/positive pressure differentials are key to preventing surgical site contamination and infectious disease transmission.",
    defaultTrendDomain: "Clinical Environment",
    defaultOwner: "HVAC Engineering Lead"
  },

  // Infection Prevention and Control (IC)
  "IC.01.03.01_EP1": {
    chapter: "Infection Prevention and Control (IC)",
    standard: "IC.01.03.01",
    ep: "EP 1",
    epLanguage: "The organization identifies infection risks based on its geographic location, community, population served, the care it provides, and the analysis of surveillance data.",
    rationale: "A comprehensive infection risk assessment forms the architectural baseline of custom infection prevention guidelines and training.",
    defaultTrendDomain: "Infection Control",
    defaultOwner: "Infection Preventionist"
  },
  "IC.02.01.01_EP2": {
    chapter: "Infection Prevention and Control (IC)",
    standard: "IC.02.01.01",
    ep: "EP 2",
    epLanguage: "The organization uses standard precautions, including the use of personal protective equipment (PPE), to reduce the risk of infection.",
    rationale: "Failing to wear appropriate gloves, gowns, or masks during invasive or contamination-prone procedures risks healthcare-associated infection.",
    defaultTrendDomain: "Infection Control",
    defaultOwner: "Nurse Manager"
  },
  "IC.02.02.01_EP1": {
    chapter: "Infection Prevention and Control (IC)",
    standard: "IC.02.02.01",
    ep: "EP 1",
    epLanguage: "The organization implements infection prevention and control activities when doing the following: Cleaning and performing low-level disinfection of medical equipment, devices, and supplies.",
    rationale: "Stethoscopes, blood pressure cuffs, and point-of-care glucometers must be cleaned between patients with verified germicidal wipes.",
    defaultTrendDomain: "Infection Control",
    defaultOwner: "Nurse Manager"
  },
  "IC.02.02.01_EP2": {
    chapter: "Infection Prevention and Control (IC)",
    standard: "IC.02.02.01",
    ep: "EP 2",
    epLanguage: "The organization implements infection prevention and control activities when doing the following: Performing intermediate and high-level disinfection and sterilization of medical equipment, devices, and supplies.",
    rationale: "Reprocessing reusable surgical instruments or endoscopes requires strict adherence to manufacturer instructions and biological indicator testing.",
    defaultTrendDomain: "Infection Control",
    defaultOwner: "Sterile Processing Lead"
  },

  // Human Resources (HR)
  "HR.01.01.01_EP2": {
    chapter: "Human Resources (HR)",
    standard: "HR.01.01.01",
    ep: "EP 2",
    epLanguage: "The organization verifies and documents the credentials of care staff using the primary source when licensure, certification, or registration is required by law and regulation.",
    rationale: "Failing to perform direct board-source validation of active licenses before clinicans see patients violates federal, state, and accreditation mandates.",
    defaultTrendDomain: "Competency Verification",
    defaultOwner: "HR Credentialing Specialist"
  },
  "HR.01.04.01_EP3": {
    chapter: "Human Resources (HR)",
    standard: "HR.01.04.01",
    ep: "EP 3",
    epLanguage: "The organization orients staff on relevant policies and procedures, their specific job duties, infection prevention and control, and patient rights.",
    rationale: "Newly hired clinical personnel must complete documented orientation before performing unsupervised direct patient care.",
    defaultTrendDomain: "Competency Verification",
    defaultOwner: "HR Training Lead"
  },
  "HR.01.06.01_EP6": {
    chapter: "Human Resources (HR)",
    standard: "HR.01.06.01",
    ep: "EP 6",
    epLanguage: "Staff competence is assessed and documented once every three years, or more frequently as required by organization policy or in accordance with law and regulation.",
    rationale: "A clinical skills and equipment-handling checklist evaluation must be on file for every clinical employee at required intervals.",
    defaultTrendDomain: "Competency Verification",
    defaultOwner: "Clinical Educator"
  },

  // Life Safety (LS)
  "LS.03.01.20_EP6": {
    chapter: "Life Safety (LS)",
    standard: "LS.03.01.20",
    ep: "EP 6",
    epLanguage: "Exits, exit accesses, and exit discharges are clear of obstructions or impediments to the public way, such as clutter (equipment, carts, furniture), construction material, and snow and ice.",
    rationale: "Blocked corridors or locked exit doors during operational hours represent an immediate Life Safety threat to building evacuation.",
    defaultTrendDomain: "Life Safety",
    defaultOwner: "Safety Officer"
  },
  "LS.01.02.01_EP1": {
    chapter: "Life Safety (LS)",
    standard: "LS.01.02.01",
    ep: "EP 1",
    epLanguage: "The organization has a written interim life safety measures (ILSM) policy that covers situations when Life Safety Code deficiencies cannot be immediately corrected or during periods of construction.",
    rationale: "When fire alarms are impaired or exits are blocked by construction, compensatory safety fire-watches or additional drills must be activated.",
    defaultTrendDomain: "Life Safety",
    defaultOwner: "Facilities Lead"
  },

  // National Patient Safety Goals (NPSG)
  "NPSG.01.01.01_EP1": {
    chapter: "National Patient Safety Goals (NPSG)",
    standard: "NPSG.01.01.01",
    ep: "EP 1",
    epLanguage: "Use at least two patient identifiers when providing care, treatment, or services. Acceptable identifiers include patient name, DOB, or medical record number.",
    rationale: "Verifying identity using name and DOB prior to medication administration or blood draw prevents devastating patient-mix-up incidents.",
    defaultTrendDomain: "Patient Safety Goals",
    defaultOwner: "Clinic Director"
  },
  "NPSG.03.04.01_EP1": {
    chapter: "National Patient Safety Goals (NPSG)",
    standard: "NPSG.03.04.01",
    ep: "EP 1",
    epLanguage: "Label all medications, medication containers, and other solutions on and off the sterile field in perioperative and other procedural settings (syringes, medicine cups, basins).",
    rationale: "Unlabeled medicines on a surgical tray lead directly to injecting wrong drugs or doses during intense surgical procedures.",
    defaultTrendDomain: "Clinical Environment",
    defaultOwner: "OR Nurse Manager"
  },
  "NPSG.07.01.01_EP1": {
    chapter: "National Patient Safety Goals (NPSG)",
    standard: "NPSG.07.01.01",
    ep: "EP 1",
    epLanguage: "Comply with either the current Centers for Disease Control and Prevention (CDC) hand hygiene guidelines and/or the current World Health Organization (WHO) hand hygiene guidelines.",
    rationale: "Hand wash compliance immediately before and after patient contact is the single most effective barrier to hospital-acquired cross-contamination.",
    defaultTrendDomain: "Infection Control",
    defaultOwner: "Nurse Manager"
  }
};
