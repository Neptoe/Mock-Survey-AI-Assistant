/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MockSurveyFinding, SAFERMatrixPlacement } from "../types";
import { Search, Filter, ArrowUpDown, ChevronRight, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

interface FindingsExplorerProps {
  findings: MockSurveyFinding[];
  onSelectFinding: (id: string) => void;
  selectedSaferFilter: SAFERMatrixPlacement | null;
  onClearSaferFilter: () => void;
}

export default function FindingsExplorer({ 
  findings, 
  onSelectFinding,
  selectedSaferFilter,
  onClearSaferFilter
}: FindingsExplorerProps) {
  const [search, setSearch] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<string>("All");
  const [selectedRisk, setSelectedRisk] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "id" | "risk">("date-desc");

  // Get unique chapters for filter dropdown
  const chapters = ["All", ...Array.from(new Set(findings.map(f => f.classification?.primaryChapter).filter(Boolean)))];

  // Filter & Search Logic
  const filtered = findings.filter(f => {
    const matchesSearch = 
      f.id.toLowerCase().includes(search.toLowerCase()) ||
      f.original.clinic.toLowerCase().includes(search.toLowerCase()) ||
      f.original.department.toLowerCase().includes(search.toLowerCase()) ||
      f.original.description.toLowerCase().includes(search.toLowerCase()) ||
      (f.classification?.primaryStandard || "").toLowerCase().includes(search.toLowerCase());

    const matchesChapter = selectedChapter === "All" || f.classification?.primaryChapter === selectedChapter;
    const matchesRisk = selectedRisk === "All" || f.riskIntelligence?.surveyRiskLevel === selectedRisk;
    const matchesSafer = !selectedSaferFilter || f.riskIntelligence?.saferMatrixPlacement === selectedSaferFilter;

    return matchesSearch && matchesChapter && matchesRisk && matchesSafer;
  });

  // Sorting Logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date-desc") {
      return new Date(b.original.date).getTime() - new Date(a.original.date).getTime();
    }
    if (sortBy === "date-asc") {
      return new Date(a.original.date).getTime() - new Date(b.original.date).getTime();
    }
    if (sortBy === "id") {
      return a.id.localeCompare(b.id);
    }
    if (sortBy === "risk") {
      const riskWeight = { "High": 3, "Moderate": 2, "Low": 1, undefined: 0 };
      const rA = riskWeight[a.riskIntelligence?.surveyRiskLevel as "High" | "Moderate" | "Low" || undefined];
      const rB = riskWeight[b.riskIntelligence?.surveyRiskLevel as "High" | "Moderate" | "Low" || undefined];
      return rB - rA;
    }
    return 0;
  });

  return (
    <div id="findings-explorer" className="space-y-md animate-fadeIn">
      {/* Filters and Search toolbar */}
      <div className="bg-white p-md rounded-xl border border-outline-variant/30 shadow-sm space-y-sm">
        <div className="flex flex-col md:flex-row gap-sm items-center">
          {/* Search bar */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Finding ID, clinic, standard, keywords..."
              className="w-full pl-10 pr-md py-sm border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-body-sm font-sans"
            />
          </div>

          {/* Chapter Filter */}
          <div className="flex items-center gap-xs w-full md:w-auto">
            <Filter className="w-4 h-4 text-secondary flex-shrink-0" />
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full md:w-[220px] px-sm py-sm border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-body-sm font-sans bg-white"
            >
              <option value="All">All Chapters</option>
              {chapters.filter(ch => ch !== "All").map(ch => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="w-full md:w-auto">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full md:w-[150px] px-sm py-sm border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-body-sm font-sans bg-white"
            >
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Moderate">Moderate Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          {/* Sorter */}
          <div className="flex items-center gap-xs w-full md:w-auto">
            <ArrowUpDown className="w-4 h-4 text-secondary flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full md:w-[160px] px-sm py-sm border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-body-sm font-sans bg-white"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="id">Finding ID</option>
              <option value="risk">SAFER Severity</option>
            </select>
          </div>
        </div>

        {/* Selected SAFER Cell Filter Alert */}
        {selectedSaferFilter && (
          <div className="flex items-center justify-between p-sm bg-primary-fixed/20 border border-primary/20 rounded-lg font-sans text-xs">
            <span className="text-primary font-semibold">
              Currently filtering by SAFER Matrix placement: <strong className="uppercase">{selectedSaferFilter}</strong> ({sorted.length} matches)
            </span>
            <button
              onClick={onClearSaferFilter}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              Clear SAFER Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Results Table */}
      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        {sorted.length === 0 ? (
          <div className="py-xxl text-center max-w-sm mx-auto space-y-xs font-sans">
            <HelpCircle className="w-12 h-12 text-secondary mx-auto opacity-40" />
            <span className="font-bold text-primary block text-body-lg">No findings match filters</span>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              Try adjusting your search keywords, selected chapters, or clear your active SAFER placement filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-outline-variant/20">
              <thead className="bg-surface-container-low font-sans">
                <tr>
                  <th className="px-lg py-md text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Finding ID</th>
                  <th className="px-lg py-md text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Site / Department</th>
                  <th className="px-lg py-md text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">JC Chapter & Standard</th>
                  <th className="px-lg py-md text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">SAFER Risk Matrix</th>
                  <th className="px-lg py-md text-center text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="px-lg py-md text-center text-xs font-bold uppercase tracking-wider text-on-surface-variant">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-body-sm bg-white font-sans text-on-surface">
                {sorted.map((item) => {
                  const riskLevel = item.riskIntelligence?.surveyRiskLevel || "Moderate";
                  const placement = item.riskIntelligence?.saferMatrixPlacement || "Moderate/Pattern";
                  const standard = item.classification?.primaryStandard || "Unassigned";
                  const chapter = item.classification?.primaryChapter || "Unassigned";

                  const badgeColors = 
                    riskLevel === "High" 
                      ? "bg-red-50 text-[#ba1a1a] border-[#ba1a1a]/30" 
                      : riskLevel === "Moderate"
                        ? "bg-orange-50 text-orange-800 border-orange-200"
                        : "bg-amber-50 text-amber-800 border-amber-200";

                  const statusBadgeColors = 
                    item.status === "Complete" 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : item.status === "Needs Review"
                        ? "bg-tertiary-fixed text-on-tertiary-fixed border-on-tertiary-fixed/20"
                        : "bg-gray-100 text-secondary border-outline-variant";

                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => onSelectFinding(item.id)}
                      className="hover:bg-surface-container/30 cursor-pointer transition-colors"
                    >
                      {/* ID */}
                      <td className="px-lg py-md font-mono text-xs text-primary font-bold whitespace-nowrap">
                        {item.id}
                      </td>

                      {/* Site / Department */}
                      <td className="px-lg py-md whitespace-nowrap">
                        <span className="font-bold text-primary block text-xs">{item.original.clinic}</span>
                        <span className="text-on-surface-variant text-xs">{item.original.department}</span>
                      </td>

                      {/* JC Chapter / Standard */}
                      <td className="px-lg py-md max-w-[240px] truncate">
                        <span className="font-bold text-primary block text-xs truncate" title={chapter}>{chapter}</span>
                        <span className="font-mono text-[11px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded" title={standard}>{standard}</span>
                      </td>

                      {/* SAFER Matrix */}
                      <td className="px-lg py-md whitespace-nowrap">
                        <div className="flex items-center gap-sm">
                          <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-sm uppercase tracking-wider ${badgeColors}`}>
                            {placement}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-lg py-md text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-sm uppercase tracking-wider ${statusBadgeColors}`}>
                          {item.status === "Complete" ? "Approved" : item.status === "Needs Review" ? "Needs Review" : item.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-lg py-md text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectFinding(item.id)}
                          className="text-primary hover:text-primary-container font-sans text-xs font-bold flex items-center justify-center gap-xs mx-auto"
                        >
                          Details <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
