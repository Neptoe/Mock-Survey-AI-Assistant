/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ExecutiveDashboard from "./components/ExecutiveDashboard";
import CsvLoader from "./components/CsvLoader";
import SpecialistRunner from "./components/SpecialistRunner";
import FindingsExplorer from "./components/FindingsExplorer";
import FindingDetailView from "./components/FindingDetailView";
import ExportCenter from "./components/ExportCenter";
import { getInitialAnalyzedFindings } from "./data/mockFindings";
import { MockSurveyFinding, OriginalFinding, SAFERMatrixPlacement } from "./types";

export default function App() {
  const [section, setSection] = useState<string>("overview"); // overview, import, findings, export, pipeline
  const [findings, setFindings] = useState<MockSurveyFinding[]>(getInitialAnalyzedFindings());
  const [rawFindings, setRawFindings] = useState<OriginalFinding[]>([]);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [activeSaferFilter, setActiveSaferFilter] = useState<SAFERMatrixPlacement | null>(null);

  // Navigates and resets subviews
  const handleNavigate = (newSection: string) => {
    setSelectedFindingId(null);
    setSection(newSection);
  };

  const handleFindingsLoaded = (loaded: OriginalFinding[]) => {
    setRawFindings(loaded);
  };

  const handleAddSingleFinding = (finding: OriginalFinding) => {
    setRawFindings(prev => [...prev, finding]);
  };

  const handleClearDataset = () => {
    setRawFindings([]);
  };

  const handleRunPipeline = () => {
    setSection("pipeline");
  };

  const handlePipelineComplete = (analyzed: MockSurveyFinding[]) => {
    // Merge analyzed findings with our current list (prevent duplicates by replacing matching IDs)
    setFindings(prev => {
      const merged = [...prev];
      analyzed.forEach(newItem => {
        const existingIdx = merged.findIndex(oldItem => oldItem.id === newItem.id);
        if (existingIdx !== -1) {
          merged[existingIdx] = newItem;
        } else {
          merged.push(newItem);
        }
      });
      return merged;
    });

    setRawFindings([]); // Empty imported buffer
    setSection("findings"); // Send them to look at the evaluated findings
  };

  // Triggered when lead NP approves/rejects or edits owners inside details view
  const handleUpdateFinding = (updated: MockSurveyFinding) => {
    setFindings(prev => prev.map(f => f.id === updated.id ? updated : f));
  };

  const activeFinding = findings.find(f => f.id === selectedFindingId);

  return (
    <div className="bg-background text-on-surface font-sans min-h-screen flex flex-col">
      {/* Top Header */}
      <Header currentSection={section} onNavigate={handleNavigate} />

      <div className="flex flex-1">
        {/* Left fixed Sidebar */}
        <Sidebar 
          currentSection={selectedFindingId ? "findings" : section} 
          onNavigate={handleNavigate} 
          findingsCount={findings.length}
        />

        {/* Main Content scrollable canvas */}
        <main className="ml-64 w-full p-10 min-h-[calc(100vh-96px)] bg-surface pb-24 relative flex flex-col justify-between">
          <div className="flex-1 space-y-lg">
            {/* Detailed Subview Router */}
            {selectedFindingId && activeFinding ? (
              <FindingDetailView 
                finding={activeFinding} 
                onBack={() => setSelectedFindingId(null)}
                onUpdateFinding={handleUpdateFinding}
              />
            ) : section === "overview" ? (
              <ExecutiveDashboard 
                findings={findings}
                onSelectFinding={(id) => setSelectedFindingId(id)}
                onNavigateToSection={handleNavigate}
                onFilterBySAFERPlacement={(placement) => {
                  setActiveSaferFilter(placement);
                  handleNavigate("findings");
                }}
              />
            ) : section === "import" ? (
              <CsvLoader 
                onFindingsLoaded={handleFindingsLoaded}
                onRunPipeline={handleRunPipeline}
                rawFindings={rawFindings}
                onAddSingleFinding={handleAddSingleFinding}
                onClearDataset={handleClearDataset}
              />
            ) : section === "pipeline" ? (
              <SpecialistRunner 
                rawFindings={rawFindings}
                onAnalysisComplete={handlePipelineComplete}
              />
            ) : section === "findings" ? (
              <FindingsExplorer 
                findings={findings}
                onSelectFinding={(id) => setSelectedFindingId(id)}
                selectedSaferFilter={activeSaferFilter}
                onClearSaferFilter={() => setActiveSaferFilter(null)}
              />
            ) : section === "export" ? (
              <ExportCenter findings={findings} />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
