/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Upload, Download, Plus, FileText, AlertCircle, Play, CheckCircle2, ChevronRight, RefreshCw, Trash2, HelpCircle } from "lucide-react";
import { OriginalFinding } from "../types";
import Papa from "papaparse";

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
  const [generalError, setGeneralError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV parsing state
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [showMappingAndPreview, setShowMappingAndPreview] = useState(false);

  // Column mapping state
  const [dateColIdx, setDateColIdx] = useState<number>(-1);
  const [clinicColIdx, setClinicColIdx] = useState<number>(-1);
  const [deptColIdx, setDeptColIdx] = useState<number>(-1);
  const [descColIdx, setDescColIdx] = useState<number>(-1);
  const [confirmingMapping, setConfirmingMapping] = useState(false);

  // Validation results
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewFindings, setPreviewFindings] = useState<OriginalFinding[]>([]);
  const [userConfirmedCorrect, setUserConfirmedCorrect] = useState(false);

  // Manual form state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualDate, setManualDate] = useState("2026-07-16");
  const [manualClinic, setManualClinic] = useState("St. Jude Medical Center");
  const [manualDept, setManualDept] = useState("Internal Medicine (4B)");
  const [manualDesc, setManualDesc] = useState("");

  // Download a safe, standard template with complex quoted fields and commas inside quotes
  const downloadTemplate = () => {
    const csvContent = 
      "Date,Clinic,Department,Description\n" +
      "2026-07-16,St. Jude Medical Center,Internal Medicine (4B),\"Several vials of Influenza vaccines were found with expiration dates ranging from August 2023 to September 2023 inside the medication refrigerator. Temperature logs were missing.\"\n" +
      "2026-07-15,Hope Ambulatory Center,Day Surgery Corridor,\"Two large medical supply carts and a broken patient stretcher were observed parked in the main exit corridor, narrowing the egress path to 28 inches.\"\n" +
      "2026-07-14,Mercy Family Clinic,Pediatrics Desk,\"Staff were observed failing to perform hand hygiene when entering patient exam rooms. Hand wash compliance is below standard.\"";
    
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

  // Perform robust Papa Parse loading
  const loadCsvContent = (text: string) => {
    setGeneralError(null);
    setValidationErrors([]);
    setUserConfirmedCorrect(false);

    Papa.parse<string[]>(text, {
      header: false,
      skipEmptyLines: "greedy",
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          const firstErr = results.errors[0];
          setGeneralError(`CSV Parsing Error: ${firstErr.message} at line ${firstErr.row}`);
          return;
        }

        const data = results.data;
        if (!data || data.length < 1) {
          setGeneralError("The CSV file is empty or unreadable.");
          return;
        }

        const csvHeaders = data[0].map(h => (h || "").trim());
        const csvRowsData = data.slice(1);

        if (csvHeaders.length === 0) {
          setGeneralError("The CSV file lacks columns or header rows.");
          return;
        }

        setHeaders(csvHeaders);
        setRawRows(csvRowsData);

        // Auto-detect columns with heuristic matchers
        const lowerHeaders = csvHeaders.map(h => h.toLowerCase());

        const dCol = lowerHeaders.findIndex(h => h.includes("date") || h.includes("time") || h.includes("day"));
        const cCol = lowerHeaders.findIndex(h => h.includes("clinic") || h.includes("site") || h.includes("location") || h.includes("facility") || h.includes("hospital"));
        const dpCol = lowerHeaders.findIndex(h => h.includes("department") || h.includes("room") || h.includes("dept") || h.includes("area"));
        const descCol = lowerHeaders.findIndex(h => h.includes("description") || h.includes("finding") || h.includes("text") || h.includes("observation") || h.includes("verbatim") || h.includes("desc"));

        setDateColIdx(dCol);
        setClinicColIdx(cCol);
        setDeptColIdx(dpCol);
        setDescColIdx(descCol);

        setShowMappingAndPreview(true);
      },
      error: (err) => {
        setGeneralError(`Failed to load file: ${err.message}`);
      }
    });
  };

  // Process mapping and run strict validations
  useEffect(() => {
    if (!showMappingAndPreview || headers.length === 0) return;

    const errors: string[] = [];
    const parsed: OriginalFinding[] = [];

    // Ensure description column is selected
    if (descColIdx === -1) {
      errors.push("Missing required field mapping: Please confirm which column contains the finding description.");
      setValidationErrors(errors);
      setPreviewFindings([]);
      return;
    }

    let emptyDescCount = 0;
    let shortWordCount = 0;
    let singleWordFragmentCount = 0;

    rawRows.forEach((row, index) => {
      // 1-indexed row number in the actual CSV file
      const rowNum = index + 2; 

      // Extract raw values safely
      const dateVal = dateColIdx !== -1 && row[dateColIdx] ? row[dateColIdx].trim() : new Date().toISOString().split("T")[0];
      const clinicVal = clinicColIdx !== -1 && row[clinicColIdx] ? row[clinicColIdx].trim() : "Ambulatory Clinic";
      const deptVal = deptColIdx !== -1 && row[deptColIdx] ? row[deptColIdx].trim() : "General Practice";
      const descVal = descColIdx !== -1 && row[descColIdx] ? row[descColIdx].trim() : "";

      // Rule 1: check for blank descriptions
      if (!descVal) {
        emptyDescCount++;
      }

      // Count words in description
      const words = descVal.split(/\s+/).filter(Boolean);
      const wordCount = words.length;

      // Rule 2: count records with fewer than 5 words
      if (wordCount > 0 && wordCount < 5) {
        shortWordCount++;
      }

      // Rule 3: check for extremely short single word tokens/fragments
      if (wordCount === 1 && /^[a-zA-Z]+$/.test(words[0])) {
        singleWordFragmentCount++;
      }

      parsed.push({
        id: `JC-CSV-${1000 + index + 1}`,
        date: dateVal || new Date().toISOString().split("T")[0],
        clinic: clinicVal || "Ambulatory Clinic",
        department: deptVal || "General Practice",
        description: descVal,
        rowNumber: rowNum
      });
    });

    // Run strict validation criteria (Requirement 8)
    if (emptyDescCount > 0) {
      errors.push(`Validation Rejected: Found ${emptyDescCount} record(s) where the finding description is blank.`);
    }

    if (parsed.length > 0) {
      const shortRatio = shortWordCount / parsed.length;
      if (shortRatio > 0.5) {
        errors.push(`Validation Rejected: The majority of records (${Math.round(shortRatio * 100)}%) contain fewer than 5 words, indicating an invalid or tokenized structure.`);
      }

      const fragmentRatio = singleWordFragmentCount / parsed.length;
      if (fragmentRatio > 0.3) {
        errors.push(`Validation Rejected: High concentration of isolated word fragments detected (e.g. "${parsed.find(p => p.description.split(/\s+/).filter(Boolean).length === 1)?.description || 'covered'}"). Complete narratives are required for multi-specialist AI analysis.`);
      }
    } else {
      errors.push("Validation Rejected: No valid rows could be extracted from the selected CSV mapping.");
    }

    setValidationErrors(errors);
    setPreviewFindings(parsed);
  }, [dateColIdx, clinicColIdx, deptColIdx, descColIdx, rawRows, headers, showMappingAndPreview]);

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
            loadCsvContent(event.target.result as string);
          }
        };
        reader.readAsText(file);
      } else {
        setGeneralError("Only .csv files are supported.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadCsvContent(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDesc.trim()) {
      setGeneralError("Please write a detailed finding description.");
      return;
    }

    // Manual finding validation
    const words = manualDesc.trim().split(/\s+/).filter(Boolean);
    if (words.length < 5) {
      setGeneralError("Observation rejected: findings must contain at least 5 words to form a valid clinical narrative.");
      return;
    }

    const newFinding: OriginalFinding = {
      id: `JC-MAN-${Date.now().toString().slice(-4)}`,
      date: manualDate,
      clinic: manualClinic,
      department: manualDept,
      description: manualDesc.trim(),
      rowNumber: rawFindings.length + 1
    };

    onAddSingleFinding(newFinding);
    setManualDesc("");
    setShowManualForm(false);
    setGeneralError(null);
  };

  const handleConfirmAndLock = () => {
    if (validationErrors.length > 0) return;
    if (!userConfirmedCorrect) return;

    // Load findings into the global application state
    onFindingsLoaded(previewFindings);
    
    // Clear CSV importer local state so the preview moves to active pipeline
    setShowMappingAndPreview(false);
    setHeaders([]);
    setRawRows([]);
    setPreviewFindings([]);
    setUserConfirmedCorrect(false);
  };

  // Check if active finding data is present in App.tsx
  const hasLoadedFindings = rawFindings.length > 0;

  return (
    <div id="csv-loader-section" className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md pb-md border-b border-outline-variant/30">
        <div>
          <h2 className="font-display text-title-md text-primary font-bold">Import Mock Survey Findings</h2>
          <p className="font-sans text-body-sm text-on-surface-variant">
            Upload surveyor narrative records from clinic walkthroughs. Built on a robust CSV engine with custom validation checks.
          </p>
        </div>
        <div className="flex gap-sm">
          <button
            id="download-template-btn"
            onClick={downloadTemplate}
            className="flex items-center gap-sm px-md py-sm bg-white border border-outline hover:bg-surface-container-low text-primary font-sans text-body-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-primary" />
            Download CSV Template
          </button>
          <button
            id="manual-add-toggle-btn"
            onClick={() => {
              setShowManualForm(!showManualForm);
              setShowMappingAndPreview(false);
            }}
            className="flex items-center gap-sm px-md py-sm bg-primary text-white hover:bg-primary-container font-sans text-body-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Manual Finding
          </button>
        </div>
      </div>

      {generalError && (
        <div className="p-md bg-error-container text-on-error-container rounded-lg border-l-4 border-error flex items-start gap-md animate-fadeIn">
          <AlertCircle className="w-5 h-5 mt-xs flex-shrink-0" />
          <div className="font-sans">
            <span className="font-bold block text-body-sm">Operational Warning</span>
            <p className="text-body-sm opacity-90">{generalError}</p>
          </div>
        </div>
      )}

      {/* Manual Input Form */}
      {showManualForm && (
        <form id="manual-finding-form" onSubmit={handleManualSubmit} className="p-lg bg-white rounded-xl border border-outline-variant/40 shadow-sm space-y-md animate-fadeIn">
          <div className="flex justify-between items-center pb-sm border-b border-outline-variant/10">
            <h3 className="font-sans text-body-lg font-bold text-primary flex items-center gap-sm">
              <Plus className="w-5 h-5 text-primary" /> Create Manual Observation Record
            </h3>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Independent Entry</span>
          </div>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-xs">Clinic / Site Location</label>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-xs">Department / Room Area</label>
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
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-xs">Surveyor Description (Full Verbatim Narrative)</label>
            <textarea
              rows={4}
              value={manualDesc}
              onChange={(e) => setManualDesc(e.target.value)}
              placeholder="Provide the complete finding. e.g. 'Several expired standard sutures were observed stored inside the clinician prep carts in patient room 4B...'"
              className="w-full p-md border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-body-sm font-sans"
              required
            />
            <p className="text-[10px] text-on-surface-variant mt-1">Must contain at least 5 words to prevent word tokenization errors.</p>
          </div>
          <div className="flex justify-end gap-sm pt-xs">
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="px-md py-sm border border-outline hover:bg-surface-container-low font-sans text-body-sm font-medium text-secondary rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-lg py-sm bg-primary text-white hover:bg-primary-container font-sans text-body-sm font-bold rounded-lg shadow-sm cursor-pointer"
            >
              Add Finding
            </button>
          </div>
        </form>
      )}

      {/* Drag & Drop Area (Only show when not previewing/mapping) */}
      {!showMappingAndPreview && (
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
            or click to select file. Built with <strong>Papa Parse</strong> to safely preserve quoted texts, commas, and line breaks.
          </p>
        </div>
      )}

      {/* CSV COLUMN MAPPING & LIVE VALIDATION VIEW */}
      {showMappingAndPreview && headers.length > 0 && (
        <div className="space-y-md animate-fadeIn">
          {/* Header & Column Selection Step */}
          <div className="bg-white p-lg rounded-xl border border-outline-variant/30 shadow-sm space-y-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-sm pb-sm border-b border-outline-variant/10">
              <div className="space-y-xs">
                <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">Step 1: Column Mapping Verification</span>
                <h3 className="font-sans text-body-lg font-bold text-primary">Verify Extracted Fields</h3>
              </div>
              <button 
                onClick={() => { setShowMappingAndPreview(false); setHeaders([]); setRawRows([]); }}
                className="text-xs text-secondary hover:text-error flex items-center gap-xs font-bold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Abort Upload
              </button>
            </div>

            {/* Warn user of low confidence mapping */}
            {descColIdx === -1 && (
              <div className="p-md bg-amber-50 text-amber-900 border-l-4 border-amber-500 rounded-r-lg font-sans text-xs flex gap-sm items-start">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong>⚠️ Missing High-Confidence Mapping:</strong> Please manually confirm which CSV column contains the verbatim surveyor description field below.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
              {/* Description Mapping */}
              <div className="space-y-xs font-sans">
                <label className="block text-xs font-bold uppercase tracking-wider text-primary">
                  Finding Description *
                </label>
                <select
                  value={descColIdx}
                  onChange={(e) => setDescColIdx(Number(e.target.value))}
                  className="w-full px-sm py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-xs font-bold font-sans bg-white"
                >
                  <option value={-1}>-- Select Description Column --</option>
                  {headers.map((h, idx) => (
                    <option key={idx} value={idx}>Column {idx + 1}: "{h}"</option>
                  ))}
                </select>
              </div>

              {/* Clinic Mapping */}
              <div className="space-y-xs font-sans">
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                  Clinic / Site Location
                </label>
                <select
                  value={clinicColIdx}
                  onChange={(e) => setClinicColIdx(Number(e.target.value))}
                  className="w-full px-sm py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-xs font-sans bg-white"
                >
                  <option value={-1}>-- Not In Dataset (Default) --</option>
                  {headers.map((h, idx) => (
                    <option key={idx} value={idx}>Column {idx + 1}: "{h}"</option>
                  ))}
                </select>
              </div>

              {/* Department Mapping */}
              <div className="space-y-xs font-sans">
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                  Department / Unit
                </label>
                <select
                  value={deptColIdx}
                  onChange={(e) => setDeptColIdx(Number(e.target.value))}
                  className="w-full px-sm py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-xs font-sans bg-white"
                >
                  <option value={-1}>-- Not In Dataset (Default) --</option>
                  {headers.map((h, idx) => (
                    <option key={idx} value={idx}>Column {idx + 1}: "{h}"</option>
                  ))}
                </select>
              </div>

              {/* Date Mapping */}
              <div className="space-y-xs font-sans">
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                  Survey Date
                </label>
                <select
                  value={dateColIdx}
                  onChange={(e) => setDateColIdx(Number(e.target.value))}
                  className="w-full px-sm py-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-xs font-sans bg-white"
                >
                  <option value={-1}>-- Not In Dataset (Today) --</option>
                  {headers.map((h, idx) => (
                    <option key={idx} value={idx}>Column {idx + 1}: "{h}"</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Validation Status Box */}
          {validationErrors.length > 0 ? (
            <div className="p-lg bg-red-50 text-red-950 rounded-xl border border-red-200 space-y-sm font-sans animate-fadeIn">
              <div className="flex items-center gap-sm font-bold text-red-800 text-body-lg">
                <AlertCircle className="w-6 h-6 text-error" /> Validation Check Rejected
              </div>
              <p className="text-body-sm text-red-900 leading-relaxed">
                The imported dataset violates quality criteria. To safeguard AI Specialist precision, please repair the CSV file or adjust the mappings before proceeding.
              </p>
              <ul className="list-disc pl-lg space-y-1 text-xs font-bold font-mono text-error">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-md bg-green-50 text-green-950 rounded-xl border border-green-200/60 font-sans flex items-start gap-md animate-fadeIn">
              <CheckCircle2 className="w-6 h-6 text-green-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-xs">
                <span className="font-bold text-green-800 text-body-sm">Dataset Successfully Validated</span>
                <p className="text-xs text-green-900">
                  Papa Parse mapped all rows securely. All mandatory fields contain coherent narratives suitable for Standards mapping, Risk evaluations, and Corrective actions.
                </p>
              </div>
            </div>
          )}

          {/* Table Preview showing required parameters */}
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-lg space-y-sm">
            <h4 className="font-sans text-body-md font-bold text-primary flex items-center gap-sm">
              <FileText className="w-4 h-4 text-primary" /> Parsed Dataset Preview ({previewFindings.length} rows verified)
            </h4>
            <div className="max-h-[300px] overflow-y-auto border border-outline-variant/20 rounded-lg">
              <table className="min-w-full divide-y divide-outline-variant/20">
                <thead className="bg-surface-container-low sticky top-0">
                  <tr className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    <th className="px-lg py-md text-left">CSV Row</th>
                    <th className="px-lg py-md text-left">Finding ID</th>
                    <th className="px-lg py-md text-left">Clinic / Location</th>
                    <th className="px-lg py-md text-left">Department</th>
                    <th className="px-lg py-md text-left">Complete Finding Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-body-sm bg-white font-sans text-on-surface">
                  {previewFindings.map((finding, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-lg py-md font-mono text-xs font-bold text-secondary">
                        Row #{finding.rowNumber}
                      </td>
                      <td className="px-lg py-md font-mono text-xs text-primary font-bold">
                        {finding.id}
                      </td>
                      <td className="px-lg py-md text-xs font-bold text-primary">
                        {finding.clinic}
                      </td>
                      <td className="px-lg py-md text-xs text-on-surface-variant font-medium">
                        {finding.department}
                      </td>
                      <td className="px-lg py-md text-xs leading-relaxed max-w-xl italic text-on-surface">
                        "{finding.description || <span className="text-error font-bold font-mono">[BLANK DESCRIPTION]</span>}"
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Confirmation Checkbox & Analyze Launch button (Strict Confirmation Gate) */}
            <div className="pt-md border-t border-outline-variant/20 flex flex-col items-center justify-center gap-md">
              <label className="flex items-center gap-md p-md bg-surface-container-low border border-outline-variant/50 rounded-lg cursor-pointer max-w-2xl select-none hover:bg-surface-container">
                <input
                  type="checkbox"
                  checked={userConfirmedCorrect}
                  disabled={validationErrors.length > 0}
                  onChange={(e) => setUserConfirmedCorrect(e.target.checked)}
                  className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                />
                <span className="font-sans text-xs text-on-surface leading-relaxed">
                  I have carefully reviewed the dataset preview and <strong>confirm</strong> that each row, clinic location, department, and verbatim finding description are correct, complete, and un-tokenized.
                </span>
              </label>

              <div className="flex gap-sm">
                <button
                  onClick={() => { setShowMappingAndPreview(false); setHeaders([]); setRawRows([]); }}
                  className="px-lg py-sm border border-outline hover:bg-surface-container-low text-secondary font-sans text-xs font-bold rounded-lg cursor-pointer"
                >
                  Discard & Start Over
                </button>
                <button
                  id="lock-dataset-btn"
                  onClick={handleConfirmAndLock}
                  disabled={validationErrors.length > 0 || !userConfirmedCorrect}
                  className="flex items-center gap-sm px-xl py-sm bg-primary text-white font-sans text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm & Lock Dataset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE DATASET STATUS (Only shown if we have locked findings in the App state) */}
      {!showMappingAndPreview && hasLoadedFindings && (
        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-lg space-y-md animate-fadeIn">
          <div className="flex justify-between items-center pb-sm border-b border-outline-variant/20">
            <h3 className="font-sans text-body-lg font-bold text-primary flex items-center gap-sm">
              <CheckCircle2 className="w-5 h-5 text-green-700" /> Active Mock Survey Dataset ({rawFindings.length} records locked)
            </h3>
            <button
              id="clear-active-dataset-btn"
              onClick={onClearDataset}
              className="text-xs font-bold text-error hover:underline uppercase tracking-wider flex items-center gap-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Locked Dataset
            </button>
          </div>

          <p className="text-xs text-on-surface-variant font-sans">
            This dataset has been confirmed and locked. You can now launch the clinical, risk, and corrective action specialist workflows.
          </p>

          <div className="max-h-[250px] overflow-y-auto border border-outline-variant/10 rounded-lg">
            <table className="min-w-full divide-y divide-outline-variant/15">
              <thead className="bg-surface-container-low">
                <tr className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  <th className="px-md py-sm text-left">ID</th>
                  <th className="px-md py-sm text-left">Site / Location</th>
                  <th className="px-md py-sm text-left">Department</th>
                  <th className="px-md py-sm text-left">Verbatim Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-body-sm bg-white font-sans text-on-surface">
                {rawFindings.map((finding) => (
                  <tr key={finding.id} className="hover:bg-surface-container-low/30 text-xs">
                    <td className="px-md py-sm font-mono font-bold text-primary">{finding.id}</td>
                    <td className="px-md py-sm font-bold text-primary">{finding.clinic}</td>
                    <td className="px-md py-sm text-secondary">{finding.department}</td>
                    <td className="px-md py-sm italic text-on-surface-variant truncate max-w-[320px]">{finding.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-sm flex justify-center">
            <button
              id="run-specialists-pipeline-btn"
              onClick={onRunPipeline}
              className="flex items-center gap-sm px-xl py-sm bg-primary hover:bg-primary-container text-white font-sans text-body-sm font-bold rounded-lg shadow-md hover:shadow-lg hover:scale-102 transition-all active:scale-98 duration-100 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Analyze Findings with Multi-Specialist AI
            </button>
          </div>
        </div>
      )}

      {/* EMPTY STATE (Only shown if we have absolutely nothing loaded or previewed) */}
      {!showMappingAndPreview && !hasLoadedFindings && (
        <div className="bg-white rounded-xl border border-outline-variant/30 p-xl text-center max-w-lg mx-auto space-y-md font-sans animate-fadeIn">
          <HelpCircle className="w-12 h-12 text-secondary mx-auto opacity-30 animate-pulse" />
          <div className="space-y-xs">
            <h3 className="font-bold text-primary text-body-lg">No Survey Findings Loaded Yet</h3>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              To begin, download our template and drag your findings CSV file above, or click "Create Manual Finding" to enter a single observation verbatim.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
