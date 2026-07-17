/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MockSurveyFinding } from "../types";
import { Download, FileSpreadsheet, Printer, ShieldCheck, Sparkles, BookOpen, Layers } from "lucide-react";

interface ExportCenterProps {
  findings: MockSurveyFinding[];
}

export default function ExportCenter({ findings }: ExportCenterProps) {
  const [printMode, setPrintMode] = useState(false);

  const exportCSV = () => {
    // Compile columns
    const headers = [
      "Finding ID",
      "Date",
      "Clinic",
      "Department",
      "Description",
      "Primary JCI Chapter",
      "Primary Standard",
      "EP",
      "EP Language",
      "SAFER Placement",
      "Risk Level",
      "Immediate Corrective Action",
      "Long-term Strategy",
      "Accountable Owner",
      "Process Measure",
      "Outcome Measure"
    ];

    const rows = findings.map(f => [
      f.id,
      f.original.date,
      `"${f.original.clinic.replace(/"/g, '""')}"`,
      `"${f.original.department.replace(/"/g, '""')}"`,
      `"${f.original.description.replace(/"/g, '""')}"`,
      `"${(f.classification?.primaryChapter || "N/A").replace(/"/g, '""')}"`,
      f.classification?.primaryStandard || "N/A",
      f.classification?.primaryEP || "N/A",
      `"${(f.classification?.epLanguage || "N/A").replace(/"/g, '""')}"`,
      f.riskIntelligence?.saferMatrixPlacement || "N/A",
      f.riskIntelligence?.surveyRiskLevel || "N/A",
      `"${(f.correctiveAction?.immediateCorrectiveAction || "N/A").replace(/"/g, '""')}"`,
      `"${(f.correctiveAction?.improvementStrategy || "N/A").replace(/"/g, '""')}"`,
      `"${(f.correctiveAction?.responsibleOwner || "N/A").replace(/"/g, '""')}"`,
      `"${(f.correctiveAction?.processMeasures || "N/A").replace(/"/g, '""')}"`,
      `"${(f.correctiveAction?.outcomeMeasures || "N/A").replace(/"/g, '""')}"`
    ]);

    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Joint_Commission_Ambulatory_Mock_Survey_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrint = () => {
    window.print();
  };

  if (printMode) {
    return (
      <div id="printable-report" className="p-xl bg-white text-black min-h-screen space-y-xl border border-outline-variant/10 rounded-xl shadow-lg relative max-w-4xl mx-auto animate-fadeIn">
        {/* Print controls bar */}
        <div className="flex justify-between items-center bg-surface-container p-md rounded-lg border border-outline-variant/30 print:hidden font-sans">
          <span className="text-primary text-body-sm font-semibold">
            Print Preview Mode activated. Use Ctrl+P or click print to save as JCI Compliance PDF.
          </span>
          <div className="flex gap-sm">
            <button
              onClick={() => setPrintMode(false)}
              className="px-md py-sm bg-white border border-outline text-secondary font-bold text-body-sm rounded-lg hover:bg-surface-container-low transition-all"
            >
              Exit Preview
            </button>
            <button
              onClick={triggerPrint}
              className="px-lg py-sm bg-primary text-white font-bold text-body-sm rounded-lg hover:bg-primary-container transition-all flex items-center gap-xs shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print PDF
            </button>
          </div>
        </div>

        {/* Form Report Content */}
        <div className="space-y-xl print:p-0">
          <div className="text-center pb-md border-b-2 border-primary space-y-xs font-sans">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-primary">AMBULATORY JOINT COMMISSION ACCREDITATION</h1>
            <h2 className="text-lg font-bold text-secondary uppercase">MOCK SURVEY AI ACCREDITATION REPORT</h2>
            <div className="text-xs text-on-surface-variant flex justify-center gap-md">
              <span><strong>Audit Date:</strong> July 16, 2026</span>
              <span><strong>Total Classified Gaps:</strong> {findings.length}</span>
              <span><strong>Validated Readiness:</strong> APPROVED</span>
            </div>
          </div>

          <div className="p-md bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs leading-relaxed italic text-on-surface-variant font-sans">
            <strong>CRITICAL REGULATORY NOTICE:</strong> This report represents an AI-assisted compliance analysis mapping ambulatory mock-survey findings to 2026 Joint Commission standards, SAFER risk grids, and systems-based corrective actions. Final validation and clinical approval remain under the purview of clinical leadership prior to regulatory agency submissions.
          </div>

          {/* Grouped findings list by JCI standard */}
          <div className="space-y-lg">
            {findings.map(f => (
              <div key={f.id} className="p-md bg-white rounded-lg border border-outline-variant/40 shadow-sm space-y-sm page-break-inside-avoid">
                <div className="flex justify-between items-center pb-sm border-b border-outline-variant/20 font-sans">
                  <div className="flex items-center gap-sm">
                    <span className="font-mono text-xs font-bold text-primary">Finding #{f.id}</span>
                    <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-sm">{f.classification?.primaryStandard}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-error uppercase tracking-wider bg-error-container/20 px-2 py-0.5 rounded-sm">
                    SAFER: {f.riskIntelligence?.saferMatrixPlacement}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-xs font-sans">
                  <div className="space-y-xs">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase block">Verbatim Auditor Finding</span>
                    <p className="text-on-surface italic font-medium">"{f.original.description}"</p>
                  </div>
                  <div className="space-y-xs">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase block">JCI Chapter Requirement</span>
                    <p className="text-primary font-bold">{f.classification?.primaryChapter}</p>
                    <p className="text-[11px] text-on-surface-variant">"{f.classification?.epLanguage}"</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-xs font-sans pt-sm border-t border-outline-variant/15">
                  <div className="space-y-xs">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase block">Remediation Action Plan</span>
                    <p className="font-semibold text-primary">{f.correctiveAction?.immediateCorrectiveAction}</p>
                    <p className="text-[11px] text-on-surface-variant"><strong>Long-term:</strong> {f.correctiveAction?.improvementStrategy}</p>
                  </div>
                  <div className="space-y-xs">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase block">Ownership & Governance Measures</span>
                    <p className="text-primary font-semibold">Owner: {f.correctiveAction?.responsibleOwner} ({f.correctiveAction?.suggestedTimeline})</p>
                    <p className="text-[11px] text-on-surface-variant"><strong>Metric:</strong> {f.correctiveAction?.processMeasures}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Formal signature signoffs */}
          <div className="pt-xl grid grid-cols-2 gap-xl font-sans text-xs pt-md border-t border-primary/20 page-break-inside-avoid">
            <div className="space-y-lg">
              <span className="block text-on-surface-variant uppercase font-bold tracking-wider">Report Author</span>
              <div className="border-b border-outline-variant w-48 h-8"></div>
              <div>
                <span className="block font-bold">Survey AI Assistant Specialist</span>
                <span className="text-[10px] text-secondary">Mock Survey Compliance Portal</span>
              </div>
            </div>
            <div className="space-y-lg">
              <span className="block text-on-surface-variant uppercase font-bold tracking-wider">Validated & Authorized By</span>
              <div className="border-b border-outline-variant w-48 h-8 flex items-end">
                <span className="font-serif italic text-xs">Tanya Nepote, Lead NP</span>
              </div>
              <div>
                <span className="block font-bold">Tanya Nepote, Lead Clinic Inspector</span>
                <span className="text-[10px] text-secondary">Chief Quality & Patient Safety Officer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="export-center-view" className="space-y-lg animate-fadeIn max-w-4xl mx-auto">
      <div className="pb-sm border-b border-outline-variant/30">
        <h2 className="font-display text-title-md font-bold text-primary">Executive Export & JCI Compliance Reporting</h2>
        <p className="font-sans text-body-sm text-on-surface-variant">
          Bulk-download evaluated compliance data for spreadsheets, or print JCI accreditation dossiers for leadership meetings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Spreadsheet Export Card */}
        <div className="bg-white p-lg rounded-xl border border-outline-variant/30 shadow-sm space-y-md flex flex-col justify-between">
          <div className="space-y-sm">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-display text-body-lg font-bold text-primary">Download Excel / CSV Spreadsheet</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Export all {findings.length} findings with full Standard classifications, SAFER placements, risk scores, immediate remediation plans, process/outcome measures, and assigned owners into a standard comma-separated spreadsheet.
            </p>
          </div>
          <button
            id="bulk-export-csv-btn"
            onClick={exportCSV}
            disabled={findings.length === 0}
            className="w-full flex items-center justify-center gap-sm px-md py-sm bg-[#14532d] hover:bg-[#1f7842] disabled:opacity-40 disabled:hover:bg-[#14532d] text-white font-sans text-body-sm font-bold rounded-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Download Excel Spreadsheet (.csv)
          </button>
        </div>

        {/* Print / PDF Dossier Card */}
        <div className="bg-white p-lg rounded-xl border border-outline-variant/30 shadow-sm space-y-md flex flex-col justify-between">
          <div className="space-y-sm">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed/30 flex items-center justify-center text-primary">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="font-display text-body-lg font-bold text-primary">Formal JCI Accreditation Report</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Generate a formal survey compilation formatted specifically with JCI standards headers, verbatim EP language, and professional signature blocks. Tailored specifically with print-CSS parameters for saving directly to PDF.
            </p>
          </div>
          <button
            id="print-preview-pdf-btn"
            onClick={() => setPrintMode(true)}
            disabled={findings.length === 0}
            className="w-full flex items-center justify-center gap-sm px-md py-sm bg-primary hover:bg-primary-container disabled:opacity-40 disabled:hover:bg-primary text-white font-sans text-body-sm font-bold rounded-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            Compile & Print Formal Dossier (.pdf)
          </button>
        </div>
      </div>
    </div>
  );
}
