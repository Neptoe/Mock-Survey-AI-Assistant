/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  MockSurveyFinding, 
  SAFERMatrixPlacement,
  HumanReviewStatus
} from "../types";
import { 
  Clock, 
  MapPin, 
  ArrowLeft, 
  Sparkles, 
  UserCheck, 
  Check, 
  X, 
  Edit3, 
  MessageSquare, 
  Download,
  BookOpen,
  Calendar,
  AlertOctagon,
  ShieldCheck
} from "lucide-react";

interface FindingDetailViewProps {
  finding: MockSurveyFinding;
  onBack: () => void;
  onUpdateFinding: (updated: MockSurveyFinding) => void;
}

export default function FindingDetailView({ 
  finding, 
  onBack, 
  onUpdateFinding 
}: FindingDetailViewProps) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Array<{author: string; date: string; text: string}>>([
    {
      author: "Survey Coordinator",
      date: "2026-07-16 10:15",
      text: "Initial walk-through finding identified. Specialist AI has completed sequential analysis."
    }
  ]);
  const [showAddComment, setShowAddComment] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [customOwner, setManualOwner] = useState(finding.correctiveAction?.responsibleOwner || "Nurse Manager");

  const original = finding.original;
  const classification = finding.classification;
  const riskIntel = finding.riskIntelligence;
  const corrective = finding.correctiveAction;

  const handleApprove = () => {
    const updated: MockSurveyFinding = {
      ...finding,
      status: "Complete",
      classification: classification ? {
        ...classification,
        humanReviewStatus: "Review Not Required"
      } : undefined,
      riskIntelligence: riskIntel ? {
        ...riskIntel,
        humanReviewStatus: "Review Not Required"
      } : undefined
    };
    onUpdateFinding(updated);
    
    // Add audit comment
    setComments(prev => [
      ...prev,
      {
        author: "Tanya Nepote (Lead)",
        date: new Date().toISOString().replace("T", " ").slice(0, 16),
        text: "Finding validated and corrective action plan APPROVED. Ready for JCI submission."
      }
    ]);
  };

  const handleReject = () => {
    const updated: MockSurveyFinding = {
      ...finding,
      status: "Needs Review",
      classification: classification ? {
        ...classification,
        humanReviewStatus: "Review Required"
      } : undefined
    };
    onUpdateFinding(updated);

    setComments(prev => [
      ...prev,
      {
        author: "Tanya Nepote (Lead)",
        date: new Date().toISOString().replace("T", " ").slice(0, 16),
        text: "Finding REJECTED for corrective action adjustments. Review system factors."
      }
    ]);
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setComments(prev => [
      ...prev,
      {
        author: "Tanya Nepote (Lead)",
        date: new Date().toISOString().replace("T", " ").slice(0, 16),
        text: commentText.trim()
      }
    ]);
    setCommentText("");
    setShowAddComment(false);
  };

  const handleOwnerUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corrective) return;

    const updated: MockSurveyFinding = {
      ...finding,
      correctiveAction: {
        ...corrective,
        responsibleOwner: customOwner
      }
    };
    onUpdateFinding(updated);
    setShowOwnerModal(false);
  };

  const exportSingleFinding = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(finding, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Finding_${finding.id}_Report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper to draw cells of SAFER Matrix in detailed bento box
  const renderSaferMatrixDetailed = () => {
    const placement = riskIntel?.saferMatrixPlacement || "Moderate/Pattern";
    
    // 3 rows (High, Moderate, Low), 3 columns (Limited, Pattern, Widespread)
    const grid: {id: SAFERMatrixPlacement; label: string; color: string}[] = [
      { id: "High/Limited", label: "H-L", color: "bg-[#ba1a1a]/20 border-red-500 text-red-950" },
      { id: "High/Pattern", label: "H-P", color: "bg-[#ba1a1a]/40 border-red-600 text-red-950" },
      { id: "High/Widespread", label: "H-W", color: "bg-[#ba1a1a] border-red-900 text-white" },
      
      { id: "Moderate/Limited", label: "M-L", color: "bg-orange-100 border-orange-300 text-orange-950" },
      { id: "Moderate/Pattern", label: "M-P", color: "bg-orange-200 border-orange-400 text-orange-950" },
      { id: "Moderate/Widespread", label: "M-W", color: "bg-orange-300 border-orange-500 text-orange-950" },
      
      { id: "Low/Limited", label: "L-L", color: "bg-amber-50 border-amber-200 text-amber-950" },
      { id: "Low/Pattern", label: "L-P", color: "bg-amber-100 border-amber-300 text-amber-950" },
      { id: "Low/Widespread", label: "L-W", color: "bg-amber-200 border-amber-400 text-amber-950" }
    ];

    return (
      <div className="grid grid-cols-3 gap-xs w-full max-w-[240px] mx-auto mt-sm">
        {grid.map(cell => {
          const isActive = placement === cell.id;
          return (
            <div 
              key={cell.id} 
              className={`aspect-square rounded flex flex-col items-center justify-center text-[8px] font-bold uppercase relative transition-all border ${
                isActive 
                  ? "ring-4 ring-primary/30 border-primary-container scale-105 z-10 bg-error/40 shadow-md" 
                  : cell.color + " opacity-60"
              }`}
            >
              {isActive && (
                <MapPin className="w-5 h-5 text-red-700 animate-bounce absolute" />
              )}
              <span className={isActive ? "mt-4 opacity-90" : ""}>{cell.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const isHighRisk = riskIntel?.surveyRiskLevel === "High";
  const needsReviewBadge = finding.status === "Needs Review" || classification?.humanReviewStatus === "Review Required";

  return (
    <div id="detailed-finding-canvas" className="space-y-lg animate-fadeIn pb-24">
      {/* Back button and page navigation header */}
      <div className="flex items-center gap-sm">
        <button
          onClick={onBack}
          className="flex items-center justify-center p-sm rounded-lg hover:bg-surface-container text-primary hover:text-primary-container transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-sans text-body-sm text-secondary">Back to Compliance Findings pipeline</span>
      </div>

      {/* Main compliance headers */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <div className="flex items-center gap-sm mb-xs">
            <span className="font-sans text-xs bg-surface-container-high px-2 py-0.5 rounded font-bold uppercase text-primary">ACC-FINDING</span>
            <span className="text-secondary font-sans text-body-sm flex items-center gap-xs">
              <Clock className="w-3.5 h-3.5" /> Checked: JCI Multi-Specialist Engine
            </span>
          </div>
          <h1 className="font-display text-headline-lg font-bold text-primary">Finding ID: #{finding.id}</h1>
        </div>

        {/* Validation Review States */}
        <div className="flex items-center gap-sm">
          {finding.status === "Complete" ? (
            <div className="flex items-center gap-xs px-lg py-sm bg-success-fixed text-on-success-fixed border border-green-300 rounded-full font-sans text-body-sm font-bold shadow-sm">
              <Check className="w-4 h-4 text-green-700" />
              <span>Accreditation Ready & Approved</span>
            </div>
          ) : needsReviewBadge ? (
            <div className="flex items-center gap-xs px-lg py-sm bg-tertiary-fixed text-on-tertiary-fixed rounded-full font-sans text-body-sm font-bold animate-pulse shadow-sm">
              <AlertOctagon className="w-4 h-4 text-orange-800" />
              <span>Awaiting Lead Physician Validation</span>
            </div>
          ) : (
            <div className="flex items-center gap-xs px-lg py-sm bg-blue-100 text-blue-800 border border-blue-200 rounded-full font-sans text-body-sm font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>Pending Final Approval</span>
            </div>
          )}
        </div>
      </div>

      {/* JCI Specialist Bento Grid */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Bento Cell 1: Original Finding Detail (span-8) */}
        <div className="col-span-12 md:col-span-8 bg-white p-lg rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between gap-md min-h-[300px]">
          <div className="space-y-md">
            <div className="flex items-center gap-sm text-primary pb-sm border-b border-outline-variant/20">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-display text-body-lg font-bold">Original Auditor Finding Details</h3>
            </div>

            {/* Tour Meta Row */}
            <div className="grid grid-cols-3 gap-sm font-sans text-xs">
              <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant/10">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Survey Date</span>
                <span className="font-semibold text-primary block mt-0.5 flex items-center gap-xs">
                  <Calendar className="w-3.5 h-3.5" /> {original.date}
                </span>
              </div>
              <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant/10">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Site Clinic</span>
                <span className="font-semibold text-primary block mt-0.5 truncate" title={original.clinic}>{original.clinic}</span>
              </div>
              <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant/10">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Clinical Dept</span>
                <span className="font-semibold text-primary block mt-0.5 truncate" title={original.department}>{original.department}</span>
              </div>
            </div>

            {/* Verbatim block */}
            <div className="p-md bg-surface-container-low rounded-lg border-l-4 border-primary">
              <p className="italic text-on-surface-variant font-sans text-body-sm leading-relaxed">
                "{original.description}"
              </p>
            </div>
          </div>

          <div className="text-[10px] text-on-surface-variant font-sans flex items-center gap-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            Authoritative source: Mock Survey Walk-through Audit logs.
          </div>
        </div>

        {/* Bento Cell 2: SAFER Risk Matrix Evaluation (span-4) */}
        <div className="col-span-12 md:col-span-4 bg-white p-lg rounded-xl border border-outline-variant/30 shadow-sm space-y-md min-h-[300px]">
          <div className="flex items-center gap-sm text-primary pb-sm border-b border-outline-variant/20">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-display text-body-lg font-bold">SAFER™ Risk Intelligence</h3>
          </div>

          <div className="space-y-sm font-sans text-xs">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant/10">
              <span className="text-on-surface-variant font-medium">Likelihood to Harm</span>
              <span className={`px-2 py-0.5 font-bold rounded-sm text-[10px] uppercase border ${
                isHighRisk ? "bg-red-50 text-error border-error/20" : "bg-orange-50 text-orange-800 border-orange-200"
              }`}>{riskIntel?.surveyRiskLevel || "Moderate"}</span>
            </div>
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant/10">
              <span className="text-on-surface-variant font-medium">Audited Scope Prevalence</span>
              <span className="text-primary font-bold">{riskIntel?.scope || "Pattern"}</span>
            </div>
            
            {/* 3x3 SAFER Matrix Visualization */}
            <div className="py-xs">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase block text-center mb-xs">Matrix Coordinates Mapping</span>
              {renderSaferMatrixDetailed()}
              <p className="text-[9px] text-center text-secondary font-mono mt-xs uppercase">{riskIntel?.saferMatrixPlacement}</p>
            </div>
          </div>
        </div>

        {/* Bento Cell 3: Standards Specialist Classifications (span-7) */}
        <div className="col-span-12 md:col-span-7 bg-white p-lg rounded-xl border border-outline-variant/30 shadow-sm space-y-md">
          <div className="flex justify-between items-center pb-sm border-b border-outline-variant/20">
            <h3 className="font-display text-body-lg font-bold text-primary flex items-center gap-sm">
              <ShieldCheck className="w-5 h-5 text-primary" /> Standards Classification Specialist
            </h3>
            <span className="px-2 py-0.5 bg-primary-container text-white text-[10px] font-mono font-semibold rounded-full">
              Confidence: {classification?.confidenceScore || 0}%
            </span>
          </div>

          <div className="space-y-md font-sans text-xs">
            <div className="grid grid-cols-2 gap-sm">
              <div className="border-l-2 border-outline-variant pl-sm">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">JCI Chapter Category</span>
                <p className="font-bold text-primary text-body-sm mt-0.5">{classification?.primaryChapter || "Unassigned"}</p>
              </div>
              <div className="border-l-2 border-outline-variant pl-sm">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Standard & Element</span>
                <p className="font-bold text-primary text-body-sm mt-0.5 font-mono">{classification?.primaryStandard || "Unassigned"}, {classification?.primaryEP || "EP"}</p>
              </div>
            </div>

            {/* Verbatim Requirement */}
            <div className="p-sm bg-surface-container-low border border-outline-variant/20 rounded-lg">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-xs">Verbatim JCI standard requirements</span>
              <p className="italic text-on-surface text-xs leading-relaxed">
                "{classification?.epLanguage || "N/A"}"
              </p>
            </div>

            {/* AI Specialist Rationale */}
            <div className="space-y-xs">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Classification Specialist Rationale</span>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                {classification?.regulatoryRationale || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Bento Cell 4: Corrective Action Plan & Leadership Sponsors (span-5) */}
        <div className="col-span-12 md:col-span-5 bg-white p-lg rounded-xl border border-outline-variant/30 shadow-sm space-y-md flex flex-col justify-between">
          <div className="space-y-md">
            <div className="flex items-center gap-sm text-primary pb-sm border-b border-outline-variant/20">
              <UserCheck className="w-5 h-5" />
              <h3 className="font-display text-body-lg font-bold">System Improvement Strategy</h3>
            </div>

            {/* Steps style corrective action timeline */}
            <div className="space-y-md font-sans text-xs">
              <div className="relative pl-md border-l border-error pb-xs">
                <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-error border border-white"></span>
                <span className="text-[10px] font-bold text-error uppercase block mb-xs">Immediate Remediation Action</span>
                <p className="font-semibold text-primary">{corrective?.immediateCorrectiveAction || "N/A"}</p>
              </div>

              <div className="relative pl-md border-l border-primary pb-xs">
                <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border border-white"></span>
                <span className="text-[10px] font-bold text-primary uppercase block mb-xs">Long-Term System Control Strategy</span>
                <p className="font-semibold text-primary">{corrective?.improvementStrategy || "N/A"}</p>
              </div>

              {/* Metrics metrics and audit logs */}
              <div className="p-sm bg-surface-container-low rounded-lg border border-outline-variant/20 space-y-sm">
                <div>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase block">Process Measures (Monitoring Audit)</span>
                  <p className="text-xs text-primary font-semibold mt-0.5">{corrective?.processMeasures || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase block">Outcome Measures (Target Goal)</span>
                  <p className="text-xs text-primary font-semibold mt-0.5">{corrective?.outcomeMeasures || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Owner details */}
          <div className="pt-md border-t border-outline-variant/20 space-y-sm">
            <div className="flex justify-between items-center text-xs font-sans">
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Accountable Owner</span>
                <span className="font-bold text-primary text-body-sm block mt-0.5">{corrective?.responsibleOwner || "Clinic Manager"}</span>
              </div>
              <button
                onClick={() => {
                  setManualOwner(corrective?.responsibleOwner || "Nurse Manager");
                  setShowOwnerModal(true);
                }}
                className="text-primary hover:underline font-sans text-body-sm font-bold"
              >
                Reassign Owner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discussion & Audit Log comments panel */}
      <div id="comments-section" className="bg-white p-lg rounded-xl border border-outline-variant/30 shadow-sm space-y-md">
        <div className="flex justify-between items-center pb-sm border-b border-outline-variant/20">
          <h3 className="font-display text-body-lg font-bold text-primary flex items-center gap-sm">
            <MessageSquare className="w-5 h-5 text-primary" /> Joint Commission Compliance Audit Log & Notes
          </h3>
          <button
            onClick={() => setShowAddComment(!showAddComment)}
            className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
          >
            Add Auditor Comment
          </button>
        </div>

        <div className="space-y-sm max-h-[250px] overflow-y-auto pr-sm">
          {comments.map((comment, index) => (
            <div key={index} className="p-sm bg-surface-container-low rounded-lg space-y-xs font-sans text-xs border border-outline-variant/10">
              <div className="flex justify-between items-center font-bold text-primary">
                <span>{comment.author}</span>
                <span className="text-secondary font-mono font-normal">{comment.date}</span>
              </div>
              <p className="text-on-surface-variant italic leading-relaxed">
                "{comment.text}"
              </p>
            </div>
          ))}
        </div>

        {showAddComment && (
          <form onSubmit={handleAddCommentSubmit} className="space-y-sm animate-fadeIn">
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Type your compliance note or justification here..."
              className="w-full p-sm border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-xs font-sans"
              required
            />
            <div className="flex justify-end gap-sm">
              <button
                type="button"
                onClick={() => setShowAddComment(false)}
                className="px-sm py-1.5 border border-outline hover:bg-surface-container font-sans text-xs text-secondary rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-md py-1.5 bg-primary text-white hover:bg-primary-container font-sans text-xs font-bold rounded"
              >
                Submit Comment
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reassign Owner Modal Overlay */}
      {showOwnerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <form onSubmit={handleOwnerUpdate} className="bg-white rounded-xl shadow-xl border border-outline-variant/30 p-lg max-w-sm w-full space-y-md font-sans">
            <h3 className="font-display text-body-lg font-bold text-primary">Reassign Accountable Owner</h3>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-xs">Responsible Professional Title</label>
              <input
                type="text"
                value={customOwner}
                onChange={(e) => setManualOwner(e.target.value)}
                placeholder="e.g. Chief Quality Officer"
                className="w-full px-sm py-sm border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-body-sm font-sans"
                required
              />
            </div>
            <div className="flex justify-end gap-sm pt-xs">
              <button
                type="button"
                onClick={() => setShowOwnerModal(false)}
                className="px-sm py-1.5 border border-outline hover:bg-surface-container text-xs text-secondary rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-md py-1.5 bg-primary text-white hover:bg-primary-container text-xs font-bold rounded"
              >
                Save Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Persistent Sticky Action Bar matching Google Stitch */}
      <div className="fixed bottom-0 left-64 right-0 h-20 bg-white/70 backdrop-blur-md border-t border-outline-variant/30 px-container-margin flex items-center justify-between z-50 shadow-md">
        <div className="flex items-center gap-md">
          <button
            onClick={() => setShowAddComment(true)}
            className="flex items-center gap-xs px-md py-sm text-primary hover:bg-surface-container font-sans text-body-sm font-bold rounded-lg transition-all"
          >
            <MessageSquare className="w-4 h-4 text-primary" /> Add Comment
          </button>
          <button
            onClick={exportSingleFinding}
            className="flex items-center gap-xs px-md py-sm text-primary hover:bg-surface-container font-sans text-body-sm font-bold rounded-lg transition-all"
          >
            <Download className="w-4 h-4 text-primary" /> Export Finding
          </button>
        </div>
        <div className="flex items-center gap-md">
          <button
            onClick={handleReject}
            className="px-lg py-sm border border-error text-error font-sans text-body-sm font-bold rounded-lg hover:bg-error/5 transition-all"
          >
            Reject Plan
          </button>
          <button
            onClick={handleApprove}
            className="px-xl py-sm bg-primary text-white font-sans text-body-sm font-bold rounded-lg shadow hover:shadow-md transition-all active:scale-95 duration-100"
          >
            Approve Finding
          </button>
        </div>
      </div>
    </div>
  );
}
