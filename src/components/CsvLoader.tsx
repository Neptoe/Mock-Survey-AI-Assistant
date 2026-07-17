/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Upload, Download, Plus, FileText, AlertCircle, Play } from "lucide-react";
import { OriginalFinding } from "../types";

interface CsvLoaderProps {
  onFindingsLoaded: (findings: OriginalFinding[]) => void;
  onRunPipeline: () => void;
  rawFindings: OriginalFinding[];
  onAddSingleFinding: (finding: OriginalFinding) => void;
  onClearDataset: () => void;
}

export default function CsvLoader({
  onFindingsLoaded,
  onRunPipeline,
  rawFindings,
  onAddSingleFinding,
  onClearDataset,
}: CsvLoaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual form state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualDate, setManualDate] = useState("2026-07-16");
  const [manualClinic, setManualClinic] = useState("St. Jude Medical Center");
  const [manualDept, setManualDept] = useState("Internal Medicine (4B)");
  const [manualDesc, setManualDesc] = useState("");

  const downloadTemplate = () => {
    const csvContent = 
      "Date,Clinic,Department,Description\n" +
      "2026-07-16,St. Jude Medical Center,Internal Medicine (4B),Several vials of Influenza vaccines were found with expiration dates ranging from August 2023 to September 2023 inside the medication refrigerator. Temperature logs were missing.\n" +
      "2026-07-15,Hope Ambulatory Center,Day Surgery Corridor,Two large medical supply carts and a broken patient stretcher were observed parked in the main exit corridor narrowing the egress path to 28 inches.\n" +
      "2026-07-14,Mercy Family Clinic,Pediatrics Desk,Staff were observed failing to perform hand hygiene when entering patient exam rooms. Hand wash compliance is below standard.";
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "JCI_Mock_Survey_Template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseCsvText = (text: string) => {
    try {
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        throw new Error("CSV file is empty or lacks headers");
      }

      // Simple CSV parsing that accounts for potential quotes
      const parsed: OriginalFinding[] = [];
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      
      const dateIdx = headers.indexOf("date");
      const clinicIdx = headers.indexOf("clinic");
      const deptIdx = headers.indexOf("department");
      const descIdx = headers.indexOf("description");

      if (descIdx === -1) {
        throw new Error("Missing required column: 'Description'");
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Custom regex split to handle comma inside quotes
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
        const columns = matches.map(val => val.replace(/^"|"$/g, "").trim());

        if (columns.length === 0) continue;

        const date = dateIdx !== -1 && columns[dateIdx] ? columns[dateIdx] : new Date().toISOString().split("T")[0];
        const clinic = clinicIdx !== -1 && columns[clinicIdx] ? columns[clinicIdx] : "Ambulatory Clinic";
        const department = deptIdx !== -1 && columns[deptIdx] ? columns[deptIdx] : "General Practice";
        const description = columns[descIdx] || columns[0] || "No description provided.";

        parsed.push({
          id: `JC-CSV-${1000 + parsed.length + i}`,
          date,
          clinic,
          department,
          description,
        });
      }

      if (parsed.length === 0) {
        throw new Error("No valid data rows found in CSV");
      }

      onFindingsLoaded(parsed);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to parse CSV file");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            parseCsvText(event.target.result as string);
          }
        };
        reader.readAsText(file);
      } else {
        setError("Only .csv files are supported.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          parseCsvText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDesc.trim()) {
      setError("Please write a detailed finding description.");
      return;
    }

    const newFinding: OriginalFinding = {
      id: `JC-MAN-${Date.now().toString().slice(-4)}`,
      date: manualDate,
      clinic: manualClinic,
      department: manualDept,
      description: manualDesc.trim(),
    };

    onAddSingleFinding(newFinding);
    setManualDesc("");
    setShowManualForm(false);
    setError(null);
  };

  return (
    <div id="csv-loader-section" className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md pb-md border-b border-outline-variant/30">
        <div>
          <h2 className="font-display text-title-md text-primary font-bold">Import Mock Survey Findings</h2>
          <p className="font-sans text-body-sm text-on-surface-variant">
            Upload custom findings from clinic walk-through audits in CSV format or add single instances.
          </p>
        </div>
        <div className="flex gap-sm">
          <button
            id="download-template-btn"
            onClick={downloadTemplate}
            className="flex items-center gap-sm px-md py-sm bg-white border border-outline hover:bg-surface-container-low text-primary font-sans text-body-sm font-semibold rounded-lg shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-primary" />
            Download Template
          </button>
          <button
            id="manual-add-toggle-btn"
            onClick={() => setShowManualForm(!showManualForm)}
            className="flex items-center gap-sm px-md py-sm bg-primary text-white hover:bg-primary-container font-sans text-body-sm font-semibold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Manual Finding
          </button>
        </div>
      </div>

      {error && (
        <div className="p-md bg-error-container text-on-error-container rounded-lg border-l-4 border-error flex items-start gap-md animate-pulse">
          <AlertCircle className="w-5 h-5 mt-xs flex-shrink-0" />
          <div>
            <span className="font-bold block text-body-sm">Import Error</span>
            <p className="text-body-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Manual Input Form */}
      {showManualForm && (
        <form id="manual-finding-form" onSubmit={handleManualSubmit} className="p-lg bg-white rounded-xl border border-outline-variant/40 shadow-sm space-y-md animate-fadeIn">
          <h3 className="font-sans text-body-lg font-bold text-primary flex items-center gap-sm">
            <Plus className="w-5 h-5 text-primary-container" /> Create New Observation Record
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-xs">Survey Date</label>
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="w-full px-sm py-sm border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-body-sm font-sans"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-xs">Clinic / Site</label>
              <input
                type="text"
                value={manualClinic}
                onChange={(e) => setManualClinic(e.target.value)}
                placeholder="e.g. St. Jude Medical Center"
                className="w-full px-sm py-sm border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-body-sm font-sans"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-xs">Department / Room</label>
              <input
                type="text"
                value={manualDept}
                onChange={(e) => setManualDept(e.target.value)}
                placeholder="e.g. Minor Procedures Suite"
                className="w-full px-sm py-sm border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-body-sm font-sans"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-xs">Surveyor Description (Verbatim Finding)</label>
            <textarea
              rows={4}
              value={manualDesc}
              onChange={(e) => setManualDesc(e.target.value)}
              placeholder="e.g. During the environmental tour of the Minor Procedures room, expired standard sutures were found inside the clinician prep carts..."
              className="w-full p-md border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-body-sm font-sans"
              required
            />
          </div>
          <div className="flex justify-end gap-sm pt-xs">
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="px-md py-sm border border-outline hover:bg-surface-container-low font-sans text-body-sm font-medium text-secondary rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-lg py-sm bg-primary text-white hover:bg-primary-container font-sans text-body-sm font-bold rounded-lg shadow-sm"
            >
              Add Finding
            </button>
          </div>
        </form>
      )}

      {/* Drag & Drop Area */}
      <div
        id="drag-and-drop-zone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          dragActive 
            ? "border-primary bg-primary-fixed/20 shadow-md" 
            : "border-outline-variant/60 hover:border-primary hover:bg-surface-container-low"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />
        <div className="w-12 h-12 rounded-full bg-primary-fixed/30 flex items-center justify-center mb-md border border-primary/20">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <p className="font-sans text-body-lg text-primary font-semibold mb-xs">
          Drag & Drop your mock findings CSV here
        </p>
        <p className="font-sans text-body-sm text-on-surface-variant max-w-sm">
          or click to select file from your explorer. Template columns must map to <code className="font-mono text-xs px-1 py-0.5 bg-surface-container-high rounded font-semibold text-primary">Date, Clinic, Department, Description</code>.
        </p>
      </div>

      {/* Preview Table */}
      {rawFindings.length > 0 && (
        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-lg space-y-md">
          <div className="flex justify-between items-center pb-sm border-b border-outline-variant/20">
            <h3 className="font-sans text-body-lg font-bold text-primary flex items-center gap-sm">
              <FileText className="w-5 h-5 text-primary" /> Dataset Preview ({rawFindings.length} raw findings ready for analysis)
            </h3>
            <button
              id="clear-dataset-btn"
              onClick={onClearDataset}
              className="text-xs font-bold text-error hover:underline uppercase tracking-wider"
            >
              Clear Dataset
            </button>
          </div>

          <div className="max-h-[300px] overflow-y-auto border border-outline-variant/20 rounded-lg">
            <table className="min-w-full divide-y divide-outline-variant/20">
              <thead className="bg-surface-container-low sticky top-0">
                <tr>
                  <th className="px-md py-sm text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">ID</th>
                  <th className="px-md py-sm text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Date</th>
                  <th className="px-md py-sm text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Clinic & Department</th>
                  <th className="px-md py-sm text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Survey Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-body-sm bg-white font-sans text-on-surface">
                {rawFindings.map((finding, idx) => (
                  <tr key={finding.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-md py-sm font-mono text-xs text-primary font-bold">{finding.id}</td>
                    <td className="px-md py-sm whitespace-nowrap text-secondary text-xs">{finding.date}</td>
                    <td className="px-md py-sm whitespace-nowrap text-xs">
                      <span className="font-bold text-primary block">{finding.clinic}</span>
                      <span className="text-on-surface-variant">{finding.department}</span>
                    </td>
                    <td className="px-md py-sm text-body-sm line-clamp-2 max-w-lg overflow-hidden text-ellipsis italic text-on-surface-variant">
                      "{finding.description}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-sm flex justify-center">
            <button
              id="run-specialists-pipeline-btn"
              onClick={onRunPipeline}
              className="flex items-center gap-sm px-xl py-sm bg-primary hover:bg-primary-container text-white font-sans text-body-sm font-bold rounded-lg shadow-md hover:shadow-lg hover:scale-102 transition-all active:scale-98 duration-100"
            >
              <Play className="w-4 h-4 fill-white" />
              Analyze Findings with Multi-Specialist AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
