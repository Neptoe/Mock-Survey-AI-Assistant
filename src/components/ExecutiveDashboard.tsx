/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  MockSurveyFinding, 
  SAFERMatrixPlacement, 
  ExecutivePriority,
  SurveyReadiness
} from "../types";
import { 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  Award, 
  MapPin, 
  UserCheck, 
  Eye, 
  Sparkles,
  ArrowRight
} from "lucide-react";

interface ExecutiveDashboardProps {
  findings: MockSurveyFinding[];
  onSelectFinding: (id: string) => void;
  onNavigateToSection: (section: string) => void;
  onFilterBySAFERPlacement: (placement: SAFERMatrixPlacement | null) => void;
}

export default function ExecutiveDashboard({ 
  findings, 
  onSelectFinding, 
  onNavigateToSection,
  onFilterBySAFERPlacement
}: ExecutiveDashboardProps) {

  // 1. Calculate General Aggregations
  const total = findings.length;
  const highRisk = findings.filter(f => f.riskIntelligence?.surveyRiskLevel === "High").length;
  const needsReview = findings.filter(f => f.status === "Needs Review" || f.classification?.humanReviewStatus === "Review Required").length;
  const completed = findings.filter(f => f.status === "Complete").length;

  // 2. Determine Overall Survey Readiness Level
  let readiness: SurveyReadiness = "Survey Ready";
  let readinessDescription = "All monitored standards reflect a clean compliance pattern. Routine surveillance active.";
  let readinessColor = "bg-green-100 text-green-800 border-green-200";

  const highWidespreadOrPattern = findings.filter(f => 
    f.riskIntelligence?.saferMatrixPlacement === "High/Widespread" || 
    f.riskIntelligence?.saferMatrixPlacement === "High/Pattern"
  ).length;

  if (highWidespreadOrPattern > 0) {
    readiness = "Immediate Leadership Attention";
    readinessDescription = "Critical life safety or systemic clinical errors observed. High risk of accreditation withholding.";
    readinessColor = "bg-red-100 text-red-800 border-red-200 animate-pulse";
  } else if (highRisk > 0) {
    readiness = "Significant Improvement Needed";
    readinessDescription = "Isolated high-risk findings observed. Active corrective actions required before surveyors arrive.";
    readinessColor = "bg-orange-100 text-orange-800 border-orange-200";
  } else if (needsReview > 0) {
    readiness = "Moderate Improvement Needed";
    readinessDescription = "Pending human reviews for ambiguous observations. Mild compliance pattern variation detected.";
    readinessColor = "bg-amber-100 text-amber-800 border-amber-200";
  } else if (total > 0) {
    readiness = "Minor Improvement Needed";
    readinessDescription = "Administrative updates or routine audit logs pending completion. Standard process control intact.";
    readinessColor = "bg-blue-100 text-blue-800 border-blue-200";
  }

  // 3. Chapter Distribution
  const chapterCounts: Record<string, number> = {};
  findings.forEach(f => {
    const chapter = f.classification?.primaryChapter || "Unassigned";
    chapterCounts[chapter] = (chapterCounts[chapter] || 0) + 1;
  });

  // 4. Trend Domain Distribution
  const domainCounts: Record<string, number> = {};
  findings.forEach(f => {
    const domain = f.riskIntelligence?.trendDomain || "Other";
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  });

  // 5. SAFER Placement Distribution
  const placementCounts: Record<SAFERMatrixPlacement, number> = {
    "Low/Limited": 0, "Low/Pattern": 0, "Low/Widespread": 0,
    "Moderate/Limited": 0, "Moderate/Pattern": 0, "Moderate/Widespread": 0,
    "High/Limited": 0, "High/Pattern": 0, "High/Widespread": 0,
    "Immediate Threat to Life": 0
  };
  findings.forEach(f => {
    const placement = f.riskIntelligence?.saferMatrixPlacement;
    if (placement && placement in placementCounts) {
      placementCounts[placement]++;
    }
  });

  // 6. Intervention Strength
  let strongCount = 0;
  let moderateCount = 0;
  let weakCount = 0;
  findings.forEach(f => {
    const strength = f.correctiveAction?.interventionStrength;
    if (strength === "Strong") strongCount++;
    else if (strength === "Moderate") moderateCount++;
    else if (strength === "Weak") weakCount++;
  });

  return (
    <div id="executive-dashboard-view" className="space-y-lg animate-fadeIn">
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        {/* Card 1: Total Findings */}
        <div className="bg-white p-md rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-md">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-variant block">Total Findings</span>
            <span className="font-sans text-title-md font-bold text-primary block leading-none mt-1">{total}</span>
            <span className="text-[10px] text-secondary">Mock tour dataset</span>
          </div>
        </div>

        {/* Card 2: High Risk Placements */}
        <div className="bg-white p-md rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-md">
          <div className="w-12 h-12 rounded-lg bg-error-container/20 flex items-center justify-center text-error">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-variant block">High Risk SAFER</span>
            <span className="font-sans text-title-md font-bold text-error block leading-none mt-1">{highRisk}</span>
            <span className="text-[10px] text-error font-semibold">Requires escalation</span>
          </div>
        </div>

        {/* Card 3: Pending Human Validation */}
        <div className="bg-white p-md rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-md">
          <div className="w-12 h-12 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-variant block">Needs Validation</span>
            <span className="font-sans text-title-md font-bold text-on-tertiary-fixed block leading-none mt-1">{needsReview}</span>
            <span className="text-[10px] text-secondary">Awaiting clinical lead</span>
          </div>
        </div>

        {/* Card 4: Executive Watchlist */}
        <div className="bg-white p-md rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-md">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-variant block">Analyzed & Locked</span>
            <span className="font-sans text-title-md font-bold text-green-800 block leading-none mt-1">{completed}</span>
            <span className="text-[10px] text-secondary">Corrective actions approved</span>
          </div>
        </div>
      </div>

      {/* Main Bento Dashboard Grid */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Left Column: SAFER Matrix Interactive Placement Viz (8 Columns) */}
        <section className="col-span-12 md:col-span-7 bg-white p-lg rounded-xl border border-outline-variant/30 shadow-sm space-y-md">
          <div className="flex justify-between items-center pb-sm border-b border-outline-variant/20">
            <h3 className="font-display text-body-lg font-bold text-primary flex items-center gap-sm">
              <Award className="w-5 h-5 text-primary" /> Active SAFER™ Matrix Placement Grid
            </h3>
            <span className="text-secondary text-xs italic">Click cell to filter Findings Explorer</span>
          </div>

          <div className="relative">
            {/* Top immediate threat indicator */}
            <div 
              onClick={() => onFilterBySAFERPlacement("Immediate Threat to Life")}
              className="mb-2 p-sm bg-[#5c0005] hover:bg-[#80000a] text-white border border-[#400003] rounded-lg text-center font-sans text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm flex items-center justify-center gap-sm transition-all"
            >
              <AlertTriangle className="w-4 h-4 text-white animate-bounce" />
              Immediate Threat to Life or Health ({placementCounts["Immediate Threat to Life"] || 0})
            </div>

            {/* Matrix Layout */}
            <div className="grid grid-cols-12 gap-sm">
              {/* Row Header Labels (Likelihood to Harm) */}
              <div className="col-span-2 flex flex-col justify-between py-xl text-right pr-sm text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                <div className="h-20 flex items-center justify-end">High</div>
                <div className="h-20 flex items-center justify-end">Mod</div>
                <div className="h-20 flex items-center justify-end">Low</div>
              </div>

              {/* 3x3 Grid of SAFER Cells */}
              <div className="col-span-10 grid grid-cols-3 gap-sm">
                {/* High row */}
                <div 
                  onClick={() => { onFilterBySAFERPlacement("High/Limited"); onNavigateToSection("findings"); }}
                  className="h-20 rounded-lg bg-[#ba1a1a]/30 hover:bg-[#ba1a1a]/40 border-2 border-[#ba1a1a] flex flex-col items-center justify-center p-xs text-center cursor-pointer transition-all shadow-sm"
                >
                  <span className="text-body-sm font-bold text-red-900">{placementCounts["High/Limited"]}</span>
                  <span className="text-[8px] uppercase font-bold text-red-950">High / Ltd</span>
                </div>
                <div 
                  onClick={() => { onFilterBySAFERPlacement("High/Pattern"); onNavigateToSection("findings"); }}
                  className="h-20 rounded-lg bg-[#ba1a1a]/50 hover:bg-[#ba1a1a]/60 border-2 border-[#ba1a1a] flex flex-col items-center justify-center p-xs text-center cursor-pointer transition-all shadow-sm"
                >
                  <span className="text-body-sm font-bold text-white">{placementCounts["High/Pattern"]}</span>
                  <span className="text-[8px] uppercase font-bold text-white">High / Pat</span>
                </div>
                <div 
                  onClick={() => { onFilterBySAFERPlacement("High/Widespread"); onNavigateToSection("findings"); }}
                  className="h-20 rounded-lg bg-[#ba1a1a] hover:bg-[#ba1a1a]/95 border-2 border-red-900 flex flex-col items-center justify-center p-xs text-center cursor-pointer transition-all shadow-md scale-102"
                >
                  <span className="text-body-sm font-bold text-white">{placementCounts["High/Widespread"]}</span>
                  <span className="text-[8px] uppercase font-bold text-white">High / Wide</span>
                </div>

                {/* Moderate row */}
                <div 
                  onClick={() => { onFilterBySAFERPlacement("Moderate/Limited"); onNavigateToSection("findings"); }}
                  className="h-20 rounded-lg bg-orange-100 hover:bg-orange-200 border-2 border-orange-400 flex flex-col items-center justify-center p-xs text-center cursor-pointer transition-all shadow-sm"
                >
                  <span className="text-body-sm font-bold text-orange-900">{placementCounts["Moderate/Limited"]}</span>
                  <span className="text-[8px] uppercase font-bold text-orange-950">Mod / Ltd</span>
                </div>
                <div 
                  onClick={() => { onFilterBySAFERPlacement("Moderate/Pattern"); onNavigateToSection("findings"); }}
                  className="h-20 rounded-lg bg-orange-200 hover:bg-orange-300 border-2 border-orange-500 flex flex-col items-center justify-center p-xs text-center cursor-pointer transition-all shadow-sm"
                >
                  <span className="text-body-sm font-bold text-orange-950">{placementCounts["Moderate/Pattern"]}</span>
                  <span className="text-[8px] uppercase font-bold text-orange-950">Mod / Pat</span>
                </div>
                <div 
                  onClick={() => { onFilterBySAFERPlacement("Moderate/Widespread"); onNavigateToSection("findings"); }}
                  className="h-20 rounded-lg bg-orange-300 hover:bg-orange-400 border-2 border-orange-600 flex flex-col items-center justify-center p-xs text-center cursor-pointer transition-all shadow-sm"
                >
                  <span className="text-body-sm font-bold text-orange-950">{placementCounts["Moderate/Widespread"]}</span>
                  <span className="text-[8px] uppercase font-bold text-orange-950">Mod / Wide</span>
                </div>

                {/* Low row */}
                <div 
                  onClick={() => { onFilterBySAFERPlacement("Low/Limited"); onNavigateToSection("findings"); }}
                  className="h-20 rounded-lg bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 flex flex-col items-center justify-center p-xs text-center cursor-pointer transition-all shadow-sm"
                >
                  <span className="text-body-sm font-bold text-amber-900">{placementCounts["Low/Limited"]}</span>
                  <span className="text-[8px] uppercase font-bold text-amber-950">Low / Ltd</span>
                </div>
                <div 
                  onClick={() => { onFilterBySAFERPlacement("Low/Pattern"); onNavigateToSection("findings"); }}
                  className="h-20 rounded-lg bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 flex flex-col items-center justify-center p-xs text-center cursor-pointer transition-all shadow-sm"
                >
                  <span className="text-body-sm font-bold text-amber-950">{placementCounts["Low/Pattern"]}</span>
                  <span className="text-[8px] uppercase font-bold text-amber-950">Low / Pat</span>
                </div>
                <div 
                  onClick={() => { onFilterBySAFERPlacement("Low/Widespread"); onNavigateToSection("findings"); }}
                  className="h-20 rounded-lg bg-amber-200 hover:bg-amber-300 border-2 border-amber-500 flex flex-col items-center justify-center p-xs text-center cursor-pointer transition-all shadow-sm"
                >
                  <span className="text-body-sm font-bold text-amber-950">{placementCounts["Low/Widespread"]}</span>
                  <span className="text-[8px] uppercase font-bold text-amber-950">Low / Wide</span>
                </div>
              </div>
            </div>

            {/* Bottom column headers */}
            <div className="grid grid-cols-12 gap-sm mt-xs">
              <div className="col-span-2"></div>
              <div className="col-span-10 grid grid-cols-3 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                <div>Limited</div>
                <div>Pattern</div>
                <div>Widespread</div>
              </div>
            </div>
            <p className="text-[10px] text-center text-on-surface-variant font-sans mt-md font-semibold italic">
              SAFER Matrix Placement represents Scope (Limited to Widespread) on the X-axis, and Likelihood to Harm (Low to High) on the Y-axis.
            </p>
          </div>
        </section>

        {/* Right Column: Readiness Scorecard & Intervention Strength (5 Columns) */}
        <section className="col-span-12 md:col-span-5 bg-white p-lg rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="space-y-md">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant/20">
              <h3 className="font-display text-body-lg font-bold text-primary flex items-center gap-sm">
                <ShieldCheck className="w-5 h-5 text-primary" /> Joint Commission Survey Readiness
              </h3>
              <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded font-mono">2026 CfC</span>
            </div>

            {/* Readiness Widget */}
            <div className={`p-md rounded-lg border-l-4 ${readinessColor} font-sans space-y-xs`}>
              <div className="flex items-center gap-sm font-bold text-body-sm">
                <MapPin className="w-5 h-5" />
                <span>Status: {readiness}</span>
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {readinessDescription}
              </p>
            </div>

            {/* Intervention Strength Comparison */}
            <div className="space-y-sm">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-variant block">Intervention Strength (Systems Priority)</span>
              
              <div className="grid grid-cols-3 gap-sm">
                <div className="bg-success-fixed/20 p-sm rounded-lg border border-success-fixed text-center">
                  <span className="text-xs font-bold text-green-800 block">Strong</span>
                  <span className="text-body-sm font-bold text-green-900 block">{strongCount}</span>
                  <span className="text-[8px] text-secondary">System Controls</span>
                </div>
                <div className="bg-amber-100 p-sm rounded-lg border border-amber-200 text-center">
                  <span className="text-xs font-bold text-amber-800 block">Moderate</span>
                  <span className="text-body-sm font-bold text-amber-900 block">{moderateCount}</span>
                  <span className="text-[8px] text-secondary">Workflow Aids</span>
                </div>
                <div className="bg-surface-container p-sm rounded-lg border border-outline-variant/30 text-center">
                  <span className="text-xs font-bold text-secondary block">Weak</span>
                  <span className="text-body-sm font-bold text-on-surface block">{weakCount}</span>
                  <span className="text-[8px] text-secondary">Education Only</span>
                </div>
              </div>
              <p className="text-[9px] text-on-surface-variant italic">
                *Mandates specify preferring Strong (engineering/system controls) over Weak (education-only) interventions to ensure sustainability.
              </p>
            </div>
          </div>

          <div className="pt-md border-t border-outline-variant/20 flex justify-between items-center">
            <span className="text-xs font-bold text-primary font-mono">Mock Survey Platform v1.1</span>
            <button
              onClick={() => onNavigateToSection("export")}
              className="text-primary hover:underline font-sans text-body-sm font-bold flex items-center gap-xs"
            >
              Export Survey Pack <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>

      {/* Organizational Hotspots & Priorities Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Hotspots: JCI Chapters */}
        <section className="bg-white p-lg rounded-xl border border-outline-variant/30 shadow-sm space-y-md">
          <h3 className="font-display text-body-lg font-bold text-primary flex items-center gap-sm pb-sm border-b border-outline-variant/20">
            <TrendingUp className="w-5 h-5 text-primary" /> Compliance Gaps by JCI Chapter
          </h3>
          {total === 0 ? (
            <p className="text-body-sm text-secondary italic">No survey data loaded yet. Drop a CSV to analyze.</p>
          ) : (
            <div className="space-y-sm">
              {Object.entries(chapterCounts).map(([chapter, count]) => {
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={chapter} className="space-y-xs">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="font-bold text-primary">{chapter}</span>
                      <span className="text-secondary font-mono font-bold">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary-container h-full rounded-full" 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Executive Priorities */}
        <section className="bg-white p-lg rounded-xl border border-outline-variant/30 shadow-sm space-y-md flex flex-col justify-between">
          <div className="space-y-md">
            <h3 className="font-display text-body-lg font-bold text-primary flex items-center gap-sm pb-sm border-b border-outline-variant/20">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" /> Executive Watch List Priorities ({highRisk} items)
            </h3>
            
            {highRisk === 0 ? (
              <div className="flex flex-col items-center justify-center p-md text-center bg-success-fixed/10 border border-success-fixed/30 rounded-lg text-on-success-fixed font-sans">
                <ShieldCheck className="w-8 h-8 mb-xs" />
                <span className="font-bold text-body-sm">All Clear</span>
                <p className="text-xs">No active findings warrant Executive Watch List inclusion.</p>
              </div>
            ) : (
              <div className="space-y-sm max-h-[180px] overflow-y-auto pr-sm">
                {findings
                  .filter(f => f.riskIntelligence?.surveyRiskLevel === "High")
                  .map(f => (
                    <div 
                      key={f.id} 
                      onClick={() => onSelectFinding(f.id)}
                      className="p-sm bg-error-container/20 border border-error-container hover:bg-error-container/40 rounded-lg flex items-start justify-between cursor-pointer transition-all"
                    >
                      <div className="space-y-xs font-sans">
                        <div className="flex items-center gap-sm">
                          <span className="font-mono text-xs font-bold text-error">{f.id}</span>
                          <span className="text-[10px] bg-red-800 text-white font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{f.riskIntelligence?.saferMatrixPlacement}</span>
                        </div>
                        <p className="text-xs font-semibold text-primary line-clamp-1">{f.original.clinic} - {f.original.department}</p>
                        <p className="text-xs text-on-surface-variant line-clamp-1 italic">"{f.original.description}"</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-error flex-shrink-0 mt-xs" />
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="pt-xs flex justify-end">
            <button
              onClick={() => onNavigateToSection("findings")}
              className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-xs"
            >
              Explore findings pipeline <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
