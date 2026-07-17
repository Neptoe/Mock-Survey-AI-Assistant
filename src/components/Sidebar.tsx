/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  LayoutDashboard, 
  Upload, 
  ClipboardList, 
  Share2
} from "lucide-react";

interface SidebarProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  findingsCount: number;
}

export default function Sidebar({ currentSection, onNavigate, findingsCount }: SidebarProps) {
  return (
    <aside className="flex flex-col w-64 border-r border-outline-variant/30 bg-[#f3f4f5] dark:bg-[#191c1d] h-[calc(100vh-96px)] fixed left-0 top-24 z-40 font-sans">
      {/* Brand Metadata */}
      <div className="p-lg">
        <h2 className="text-[11px] font-sans font-bold uppercase tracking-wider text-on-surface-variant mb-xs">
          Joint Commission Readiness
        </h2>
        <p className="text-body-sm text-secondary font-medium leading-none opacity-80">
          AI-Powered Mock Surveys
        </p>
      </div>

      {/* Main navigation menu links */}
      <nav className="flex-1 space-y-1 mt-md px-sm">
        {/* Overview */}
        <button
          onClick={() => onNavigate("overview")}
          className={`w-full flex items-center justify-between py-2.5 px-md rounded-lg transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer ${
            currentSection === "overview"
              ? "bg-primary text-white shadow-sm"
              : "text-secondary hover:bg-surface-container-high"
          }`}
        >
          <span className="flex items-center gap-md">
            <LayoutDashboard className="w-4 h-4" />
            Overview Dashboard
          </span>
        </button>

        {/* Import CSV findings */}
        <button
          onClick={() => onNavigate("import")}
          className={`w-full flex items-center justify-between py-2.5 px-md rounded-lg transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer ${
            currentSection === "import"
              ? "bg-primary text-white shadow-sm"
              : "text-secondary hover:bg-surface-container-high"
          }`}
        >
          <span className="flex items-center gap-md">
            <Upload className="w-4 h-4" />
            Import Findings
          </span>
          <span className="text-[10px] font-mono bg-primary-fixed/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
            CSV
          </span>
        </button>

        {/* Findings registry */}
        <button
          onClick={() => onNavigate("findings")}
          className={`w-full flex items-center justify-between py-2.5 px-md rounded-lg transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer ${
            currentSection === "findings"
              ? "bg-primary text-white shadow-sm"
              : "text-secondary hover:bg-surface-container-high"
          }`}
        >
          <span className="flex items-center gap-md">
            <ClipboardList className="w-4 h-4" />
            Findings Explorer
          </span>
          {findingsCount > 0 && (
            <span className="text-[10px] font-mono bg-primary-fixed/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
              {findingsCount}
            </span>
          )}
        </button>

        {/* Exports */}
        <button
          onClick={() => onNavigate("export")}
          className={`w-full flex items-center justify-between py-2.5 px-md rounded-lg transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer ${
            currentSection === "export"
              ? "bg-primary text-white shadow-sm"
              : "text-secondary hover:bg-surface-container-high"
          }`}
        >
          <span className="flex items-center gap-md">
            <Share2 className="w-4 h-4" />
            Compliance Exports
          </span>
        </button>
      </nav>
    </aside>
  );
}
