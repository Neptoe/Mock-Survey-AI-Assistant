/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Play, Sparkles, CheckCircle2, ChevronRight, Activity, Terminal } from "lucide-react";
import { OriginalFinding, MockSurveyFinding } from "../types";
import { runFullPipeline, runFullPipelineAsync } from "../utils/jciClassifier";

interface SpecialistRunnerProps {
  rawFindings: OriginalFinding[];
  onAnalysisComplete: (findings: MockSurveyFinding[]) => void;
}

export default function SpecialistRunner({ rawFindings, onAnalysisComplete }: SpecialistRunnerProps) {
  const [currentStep, setCurrentStep] = useState<"idle" | "standards" | "risk" | "actions" | "completed">("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [analyzingIndex, setAnalyzingIndex] = useState(0);

  useEffect(() => {
    if (currentStep === "idle") return;

    let interval: NodeJS.Timeout;
    
    if (currentStep === "standards") {
      setLogs(prev => [...prev, `[Standards Classification Specialist] Initializing Joint Commission regulatory parser...`]);
      setLogs(prev => [...prev, `[Standards Classification Specialist] Loading ${rawFindings.length} findings for evaluation.`]);
      
      let index = 0;
      interval = setInterval(() => {
        if (index < rawFindings.length) {
          const item = rawFindings[index];
          setLogs(prev => [
            ...prev, 
            `[Standards Specialist] Analyzing Finding #${item.id} - searching keywords in "${item.description.slice(0, 40)}..."`
          ]);
          index++;
          setAnalyzingIndex(index);
          setProgress(Math.round((index / rawFindings.length) * 100));
        } else {
          clearInterval(interval);
          setLogs(prev => [...prev, `[Standards Classification Specialist] Complete. 100% of findings classified.`]);
          setTimeout(() => {
            setCurrentStep("risk");
            setProgress(0);
          }, 1000);
        }
      }, 500);
    }

    if (currentStep === "risk") {
      setLogs(prev => [...prev, `[Survey Risk Intelligence Specialist] Initializing SAFER Matrix evaluator...`]);
      let index = 0;
      interval = setInterval(() => {
        if (index < rawFindings.length) {
          const item = rawFindings[index];
          setLogs(prev => [
            ...prev, 
            `[Risk Specialist] Calculating likelihood to harm & scope for Finding #${item.id}...`
          ]);
          index++;
          setAnalyzingIndex(index);
          setProgress(Math.round((index / rawFindings.length) * 100));
        } else {
          clearInterval(interval);
          setLogs(prev => [...prev, `[Survey Risk Intelligence Specialist] Complete. SAFER matrix placements mapped.`]);
          setTimeout(() => {
            setCurrentStep("actions");
            setProgress(0);
          }, 1000);
        }
      }, 400);
    }

    if (currentStep === "actions") {
      setLogs(prev => [...prev, `[Corrective Action Specialist] Developing sustainable system improvement controls...`]);
      let index = 0;
      interval = setInterval(() => {
        if (index < rawFindings.length) {
          const item = rawFindings[index];
          setLogs(prev => [
            ...prev, 
            `[Corrective Action Specialist] Writing process/outcome metrics & assigning owner for Finding #${item.id}...`
          ]);
          index++;
          setAnalyzingIndex(index);
          setProgress(Math.round((index / rawFindings.length) * 100));
        } else {
          clearInterval(interval);
          setLogs(prev => [...prev, `[Corrective Action Specialist] Complete. All improvement plans locked.`]);
          setTimeout(() => {
            setCurrentStep("completed");
            setProgress(100);
          }, 1000);
        }
      }, 300);
    }

    if (currentStep === "completed") {
      setLogs(prev => [...prev, `[Multi-Specialist Engine] Sequenced execution complete. Launching high-precision live AI classification...`]);
      
      const processAllAsync = async () => {
        try {
          const results = await Promise.all(rawFindings.map(raw => runFullPipelineAsync(raw)));
          onAnalysisComplete(results);
        } catch (err) {
          console.error("Async execution failed, falling back to heuristics:", err);
          const results = rawFindings.map(raw => runFullPipeline(raw));
          onAnalysisComplete(results);
        }
      };

      setTimeout(() => {
        processAllAsync();
      }, 1500);
    }

    return () => clearInterval(interval);
  }, [currentStep]);

  const startAnalysis = () => {
    setCurrentStep("standards");
    setProgress(0);
    setLogs([]);
  };

  return (
    <div id="specialist-runner" className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-lg space-y-xl">
      <div className="text-center max-w-xl mx-auto space-y-sm">
        <div className="w-12 h-12 rounded-full bg-primary-fixed/20 flex items-center justify-center mx-auto text-primary border border-primary/20">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="font-display text-title-md font-bold text-primary">Multi-Specialist Execution</h2>
        <p className="font-sans text-body-sm text-on-surface-variant">
          Watch the JCI Specialists collaborate sequentially to map regulatory standards, assess risk significance using the SAFER Matrix, and develop clinical-grade corrective action plans.
        </p>
      </div>

      {currentStep === "idle" ? (
        <div className="flex flex-col items-center justify-center py-xl space-y-md">
          <div className="flex items-center justify-center gap-lg">
            <div className="px-lg py-md bg-surface-container rounded-lg border border-outline-variant text-center font-sans">
              <span className="font-bold text-primary text-body-sm block">1. Standards</span>
              <span className="text-[10px] uppercase text-on-surface-variant">Classification</span>
            </div>
            <ChevronRight className="w-5 h-5 text-secondary" />
            <div className="px-lg py-md bg-surface-container rounded-lg border border-outline-variant text-center font-sans">
              <span className="font-bold text-primary text-body-sm block">2. Risk</span>
              <span className="text-[10px] uppercase text-on-surface-variant">SAFER Matrix</span>
            </div>
            <ChevronRight className="w-5 h-5 text-secondary" />
            <div className="px-lg py-md bg-surface-container rounded-lg border border-outline-variant text-center font-sans">
              <span className="font-bold text-primary text-body-sm block">3. Corrective</span>
              <span className="text-[10px] uppercase text-on-surface-variant">Action & Metrics</span>
            </div>
          </div>

          <button
            id="start-pipeline-btn"
            onClick={startAnalysis}
            className="flex items-center gap-sm px-xl py-sm bg-primary text-white hover:bg-primary-container font-sans text-body-sm font-bold rounded-lg shadow-md transition-all scale-102"
          >
            <Play className="w-4 h-4 fill-white" />
            Trigger Specialist Workflow ({rawFindings.length} Findings)
          </button>
        </div>
      ) : (
        <div className="space-y-lg max-w-3xl mx-auto">
          {/* Animated Pipeline Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md relative">
            {/* Standards Specialist Node */}
            <div className={`p-md rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
              currentStep === "standards" 
                ? "border-primary-container bg-primary-fixed/20 ring-2 ring-primary-container/20 scale-105" 
                : currentStep !== "idle" && currentStep !== "standards"
                  ? "border-success-fixed bg-success-fixed/20 text-on-success-fixed"
                  : "border-outline-variant/30 opacity-55"
            }`}>
              {currentStep !== "idle" && currentStep !== "standards" ? (
                <CheckCircle2 className="w-6 h-6 text-green-700 mb-sm" />
              ) : (
                <Activity className={`w-6 h-6 text-primary mb-sm ${currentStep === "standards" ? "animate-spin" : ""}`} />
              )}
              <h4 className="font-sans font-bold text-body-sm text-primary">Standards Specialist</h4>
              <span className="text-[10px] text-on-surface-variant">Primary Chapter & EP Classifications</span>
            </div>

            {/* Risk Specialist Node */}
            <div className={`p-md rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
              currentStep === "risk" 
                ? "border-primary-container bg-primary-fixed/20 ring-2 ring-primary-container/20 scale-105" 
                : currentStep === "actions" || currentStep === "completed"
                  ? "border-success-fixed bg-success-fixed/20 text-on-success-fixed"
                  : "border-outline-variant/30 opacity-55"
            }`}>
              {currentStep === "actions" || currentStep === "completed" ? (
                <CheckCircle2 className="w-6 h-6 text-green-700 mb-sm" />
              ) : (
                <Activity className={`w-6 h-6 text-primary mb-sm ${currentStep === "risk" ? "animate-spin" : ""}`} />
              )}
              <h4 className="font-sans font-bold text-body-sm text-primary">Risk Specialist</h4>
              <span className="text-[10px] text-on-surface-variant">SAFER Matrix Evaluations & Trends</span>
            </div>

            {/* Corrective Action Specialist Node */}
            <div className={`p-md rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
              currentStep === "actions" 
                ? "border-primary-container bg-primary-fixed/20 ring-2 ring-primary-container/20 scale-105" 
                : currentStep === "completed"
                  ? "border-success-fixed bg-success-fixed/20 text-on-success-fixed"
                  : "border-outline-variant/30 opacity-55"
            }`}>
              {currentStep === "completed" ? (
                <CheckCircle2 className="w-6 h-6 text-green-700 mb-sm" />
              ) : (
                <Activity className={`w-6 h-6 text-primary mb-sm ${currentStep === "actions" ? "animate-spin" : ""}`} />
              )}
              <h4 className="font-sans font-bold text-body-sm text-primary">Corrective Action Specialist</h4>
              <span className="text-[10px] text-on-surface-variant">Sustainable Systems & Metrics</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-sm">
            <div className="flex justify-between items-center text-xs font-bold font-sans uppercase tracking-wider text-on-surface-variant">
              <span>Sequence Progress ({currentStep === "standards" ? "1/3 Standards" : currentStep === "risk" ? "2/3 Risk Matrix" : currentStep === "actions" ? "3/3 Corrective Actions" : "Wrapping up"})</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden border border-outline-variant/20 shadow-inner">
              <div 
                className="bg-primary h-full transition-all duration-300 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Simulated Logs Terminal Console */}
          <div className="bg-[#121820] text-gray-300 rounded-xl p-md border border-[#232e3b] shadow-inner font-mono text-xs space-y-sm">
            <div className="flex items-center justify-between pb-sm border-b border-[#232e3b] text-gray-500">
              <span className="flex items-center gap-sm">
                <Terminal className="w-4 h-4 text-primary-container" />
                Specialist Console output logs
              </span>
              <span className="animate-pulse flex items-center gap-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                ACTIVE
              </span>
            </div>
            <div className="h-[200px] overflow-y-auto space-y-xs scrollbar-thin scrollbar-thumb-gray-700">
              {logs.map((log, idx) => (
                <div key={idx} className="animate-fadeIn">
                  <span className="text-secondary">[{new Date().toLocaleTimeString()}]</span>{" "}
                  <span className={log.includes("Complete") ? "text-green-400 font-bold" : log.includes("Error") ? "text-red-400" : ""}>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
