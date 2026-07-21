/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Play, CheckCircle2, AlertTriangle, FileText, Code, Database, Compass, Terminal } from "lucide-react";
import { OriginalFinding } from "../types";

interface TestCase {
  id: string;
  title: string;
  description: string;
  clinic: string;
  department: string;
  status: "idle" | "running" | "success" | "error";
  promptSent?: string;
  retrievedPassages?: string;
  structuredResponse?: any;
  finalClassification?: any;
  errorMsg?: string;
}

export default function Agent1TestMode() {
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: "TC-001",
      title: "Eye Wash Log",
      description: "Eye wash log missing documentation for filter changes",
      clinic: "St. Jude Medical Center",
      department: "Emergency Department",
      status: "idle"
    },
    {
      id: "TC-002",
      title: "Equipment PM Stickers",
      description: "Equipment missing preventive-maintenance stickers",
      clinic: "Ambulatory Surgical Suite",
      department: "Sterile Processing Area",
      status: "idle"
    },
    {
      id: "TC-003",
      title: "Ceiling & Wall Integrity",
      description: "Hole in ceiling near pipe; wall crack",
      clinic: "Internal Medicine Clinic",
      department: "Utility Room 3A",
      status: "idle"
    },
    {
      id: "TC-004",
      title: "Dusty Sprinkler",
      description: "Dusty sprinkler head",
      clinic: "Pediatric Outpatient Care",
      department: "Main Corridor B Lobby",
      status: "idle"
    },
    {
      id: "TC-005",
      title: "Unmounted Power Strip",
      description: "Power strip not mounted",
      clinic: "Primary Walk-In Clinic",
      department: "Exam Room #4",
      status: "idle"
    }
  ]);

  const [activeTestCaseId, setActiveTestCaseId] = useState<string>("TC-001");

  const runTestCase = async (id: string) => {
    // Set status to running
    setTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, status: "running" } : tc));

    const tc = testCases.find(t => t.id === id);
    if (!tc) return;

    const findingPayload: OriginalFinding = {
      id: `TEST-${tc.id}`,
      date: new Date().toISOString().split("T")[0],
      clinic: tc.clinic,
      department: tc.department,
      description: tc.description
    };

    try {
      // Import database directly to send as parameter
      const { standardsDatabase } = await import("../data/standardsData");

      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finding: findingPayload,
          standardsDb: standardsDatabase
        })
      });

      if (response.ok) {
        const data = await response.json();
        const promptSent = data.promptSent;
        const retrievedPassages = data.retrievedPassages;

        // Strip prompt metadata fields from structured response view to keep it clean
        const cleanResponse = { ...data };
        delete cleanResponse.promptSent;
        delete cleanResponse.retrievedPassages;

        setTestCases(prev => prev.map(t => {
          if (t.id === id) {
            return {
              ...t,
              status: "success",
              promptSent: promptSent || "System default prompt used.",
              retrievedPassages: retrievedPassages || "No source passages retrieved.",
              structuredResponse: cleanResponse,
              finalClassification: {
                chapter: cleanResponse.primaryChapter || "Unable to Determine",
                standard: cleanResponse.primaryStandard || "Unable to Determine",
                ep: cleanResponse.primaryEP || "Unable to Determine",
                epLanguage: cleanResponse.epLanguage || "N/A"
              }
            };
          }
          return t;
        }));
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server classification returned HTTP ${response.status}`);
      }
    } catch (err: any) {
      console.error(`Test Case ${id} failed:`, err);
      setTestCases(prev => prev.map(t => {
        if (t.id === id) {
          return {
            ...t,
            status: "error",
            errorMsg: err.message || "Unknown error occurred while contacting the Gemini API."
          };
        }
        return t;
      }));
    }
  };

  const runAllTestCases = async () => {
    for (const tc of testCases) {
      await runTestCase(tc.id);
    }
  };

  const activeTC = testCases.find(t => t.id === activeTestCaseId);

  return (
    <div id="agent-1-test-mode-canvas" className="space-y-lg animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md pb-md border-b border-outline-variant/30">
        <div>
          <h2 className="font-display text-title-lg text-primary font-bold flex items-center gap-sm">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" /> Agent 1: Standards Classification Specialist Test Mode
          </h2>
          <p className="font-sans text-body-sm text-on-surface-variant">
            Execute and inspect real-time walkthrough classifications directly against the live Gemini model. Confirm prompt delivery, retrieval accuracy, and reasoning fidelity.
          </p>
        </div>
        <div>
          <button
            onClick={runAllTestCases}
            className="flex items-center gap-sm px-lg py-sm bg-primary text-white hover:bg-primary-container font-sans text-body-sm font-semibold rounded-lg shadow transition-all cursor-pointer"
          >
            <Play className="w-4 h-4" />
            Run All Test Cases
          </button>
        </div>
      </div>

      {/* Test Case Layout splits into sidebar and content */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Left Side: Test Cases Selection (span-4) */}
        <div className="col-span-12 md:col-span-4 space-y-md">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Target Audit Walkthroughs</span>
          <div className="space-y-sm">
            {testCases.map(tc => {
              const isActive = tc.id === activeTestCaseId;
              return (
                <div
                  key={tc.id}
                  onClick={() => setActiveTestCaseId(tc.id)}
                  className={`p-md rounded-xl border transition-all cursor-pointer flex justify-between items-start ${
                    isActive
                      ? "bg-primary-container/10 border-primary shadow-sm"
                      : "bg-white border-outline-variant/30 hover:border-outline"
                  }`}
                >
                  <div className="space-y-xs max-w-[80%]">
                    <span className="text-[10px] font-bold text-primary uppercase">{tc.id} : {tc.title}</span>
                    <p className="font-sans text-xs text-on-surface-variant font-medium truncate">{tc.description}</p>
                    <span className="text-[9px] font-mono text-secondary block">{tc.clinic}</span>
                  </div>
                  <div className="flex items-center">
                    {tc.status === "running" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                    ) : tc.status === "success" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : tc.status === "error" ? (
                      <AlertTriangle className="w-5 h-5 text-error" />
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runTestCase(tc.id);
                        }}
                        className="p-1 rounded bg-slate-100 hover:bg-primary/10 text-primary transition-all"
                        title="Run this test case"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Visual Execution Logs & Inspection Panels (span-8) */}
        <div className="col-span-12 md:col-span-8 space-y-lg">
          {activeTC ? (
            <div className="bg-white p-lg rounded-xl border border-outline-variant/30 shadow-sm space-y-lg">
              {/* Active TC Header */}
              <div className="flex justify-between items-center pb-sm border-b border-outline-variant/20">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase">Active Test Case : {activeTC.id}</span>
                  <h3 className="font-display text-body-lg font-bold text-primary">{activeTC.title}</h3>
                </div>
                <div>
                  <button
                    onClick={() => runTestCase(activeTC.id)}
                    disabled={activeTC.status === "running"}
                    className="flex items-center gap-xs px-md py-1.5 bg-slate-100 hover:bg-primary/10 text-primary disabled:opacity-50 font-sans text-xs font-semibold rounded"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {activeTC.status === "running" ? "Analyzing with Gemini..." : "Execute Test Case"}
                  </button>
                </div>
              </div>

              {/* Finding Summary Info Card */}
              <div className="p-sm bg-slate-50 border border-slate-200/60 rounded-lg space-y-xs font-sans text-xs">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase">Observation Statement</span>
                <p className="font-semibold text-primary italic">"{activeTC.description}"</p>
                <div className="grid grid-cols-2 gap-sm pt-xs text-[10px] text-secondary">
                  <span>Clinic: <strong>{activeTC.clinic}</strong></span>
                  <span>Department: <strong>{activeTC.department}</strong></span>
                </div>
              </div>

              {/* Conditional rendering based on state */}
              {activeTC.status === "idle" && (
                <div className="py-12 text-center space-y-sm">
                  <Compass className="w-12 h-12 text-outline mx-auto animate-pulse" />
                  <p className="font-sans text-xs text-on-surface-variant">
                    Click <strong>Execute Test Case</strong> to send this walkthrough observation directly to the live Gemini Standards Classification Specialist.
                  </p>
                </div>
              )}

              {activeTC.status === "running" && (
                <div className="py-12 text-center space-y-sm">
                  <span className="relative flex h-8 w-8 mx-auto">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-8 w-8 bg-primary"></span>
                  </span>
                  <p className="font-sans text-xs text-primary font-semibold">
                    Contacting live Gemini model using complete Standards Specialist prompt...
                  </p>
                  <p className="font-sans text-[10px] text-secondary">
                    Performing primary source reference checks, context mapping, and candidate ranking.
                  </p>
                </div>
              )}

              {activeTC.status === "error" && (
                <div className="p-md bg-error/10 border border-error/20 text-error rounded-lg space-y-sm">
                  <div className="flex items-center gap-sm">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-sans text-xs font-bold">API Execution Failure</span>
                  </div>
                  <p className="font-mono text-xs whitespace-pre-wrap">{activeTC.errorMsg}</p>
                  <p className="font-sans text-[10px] text-on-surface-variant">
                    Please ensure that your <strong>GEMINI_API_KEY</strong> is configured in the secrets dashboard tab of Google AI Studio.
                  </p>
                </div>
              )}

              {activeTC.status === "success" && (
                <div className="space-y-lg animate-fadeIn">
                  {/* Results Subgrid */}
                  <div className="grid grid-cols-12 gap-md">
                    {/* Final Classification summary box (span-12) */}
                    <div className="col-span-12 bg-green-50 p-sm rounded-lg border border-green-200 space-y-xs font-sans text-xs">
                      <div className="flex items-center gap-xs text-green-800 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Live AI Standards Classification Confirmed</span>
                      </div>
                      <div className="grid grid-cols-3 gap-sm pt-xs text-[10px] border-t border-green-100 mt-xs">
                        <div>
                          <span className="text-[9px] uppercase text-green-700 block font-bold">JCI Chapter</span>
                          <span className="font-semibold text-primary">{activeTC.finalClassification?.chapter}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-green-700 block font-bold">Standard Code</span>
                          <span className="font-semibold text-primary font-mono">{activeTC.finalClassification?.standard}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-green-700 block font-bold">Element of Performance</span>
                          <span className="font-semibold text-primary font-mono">{activeTC.finalClassification?.ep}</span>
                        </div>
                      </div>
                      <div className="pt-sm border-t border-green-100 mt-xs">
                        <span className="text-[9px] uppercase text-green-700 block font-bold">Verbatim Standard / EP Language</span>
                        <p className="italic text-primary text-[11px] mt-0.5">"{activeTC.finalClassification?.epLanguage}"</p>
                      </div>
                    </div>
                  </div>

                  {/* 3 tabs displaying details: Prompt, Retrieved Passages, Structured Response */}
                  <div className="space-y-sm">
                    {/* Panel 1: Exact Prompt Sent */}
                    <div className="border border-outline-variant/40 rounded-lg overflow-hidden">
                      <div className="bg-slate-100 px-sm py-xs border-b border-outline-variant/40 flex items-center justify-between">
                        <span className="font-sans text-[10px] font-bold text-primary uppercase flex items-center gap-xs">
                          <Terminal className="w-3.5 h-3.5" /> 1. Exact Prompt Sent to Gemini (Agent 1 Prompt)
                        </span>
                      </div>
                      <div className="p-sm bg-slate-900 text-slate-100 font-mono text-[10px] max-h-[250px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {activeTC.promptSent}
                      </div>
                    </div>

                    {/* Panel 2: Retrieved Passages */}
                    <div className="border border-outline-variant/40 rounded-lg overflow-hidden">
                      <div className="bg-slate-100 px-sm py-xs border-b border-outline-variant/40 flex items-center justify-between">
                        <span className="font-sans text-[10px] font-bold text-primary uppercase flex items-center gap-xs">
                          <Database className="w-3.5 h-3.5" /> 2. Retrieved Reference passages (JCI Context)
                        </span>
                      </div>
                      <div className="p-sm bg-slate-50 text-slate-800 font-mono text-[10px] max-h-[250px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {activeTC.retrievedPassages}
                      </div>
                    </div>

                    {/* Panel 3: Structured Model Response */}
                    <div className="border border-outline-variant/40 rounded-lg overflow-hidden">
                      <div className="bg-slate-100 px-sm py-xs border-b border-outline-variant/40 flex items-center justify-between">
                        <span className="font-sans text-[10px] font-bold text-primary uppercase flex items-center gap-xs">
                          <Code className="w-3.5 h-3.5" /> 3. Structured Model JSON Response (Reasoning fields)
                        </span>
                      </div>
                      <div className="p-sm bg-slate-900 text-green-400 font-mono text-[10px] max-h-[250px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {JSON.stringify(activeTC.structuredResponse, null, 2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
