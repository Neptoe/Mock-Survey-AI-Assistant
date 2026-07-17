/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Bell, Settings, Award } from "lucide-react";

interface HeaderProps {
  currentSection: string;
  onNavigate: (section: string) => void;
}

export default function Header({ currentSection, onNavigate }: HeaderProps) {
  return (
    <header className="flex justify-between items-center w-full px-container-margin h-16 sticky top-0 z-50 border-b border-outline-variant/30 bg-white shadow-sm font-sans">
      <div className="flex items-center gap-md">
        <div className="flex items-center gap-xs">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white border border-primary-container">
            <Award className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-title-md font-bold text-primary">
            Mock Survey Experience
          </span>
        </div>
        
        {/* Quick Nav Tabs */}
        <nav className="hidden md:flex ml-xl gap-sm">
          <button
            onClick={() => onNavigate("overview")}
            className={`text-xs font-bold uppercase tracking-wider px-sm py-1.5 rounded transition-all ${
              currentSection === "overview" 
                ? "bg-primary-fixed/20 text-primary font-bold" 
                : "text-secondary hover:bg-surface-container-low"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate("findings")}
            className={`text-xs font-bold uppercase tracking-wider px-sm py-1.5 rounded transition-all ${
              currentSection === "findings" 
                ? "bg-primary-fixed/20 text-primary font-bold" 
                : "text-secondary hover:bg-surface-container-low"
            }`}
          >
            Standards Analysis
          </button>
          <button
            onClick={() => onNavigate("export")}
            className={`text-xs font-bold uppercase tracking-wider px-sm py-1.5 rounded transition-all ${
              currentSection === "export" 
                ? "bg-primary-fixed/20 text-primary font-bold" 
                : "text-secondary hover:bg-surface-container-low"
            }`}
          >
            Compliance Exports
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-md">
        {/* Notification bells */}
        <button className="relative p-sm rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer">
          <Bell className="w-4 h-4 text-secondary" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
        </button>
        <button className="p-sm rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer">
          <Settings className="w-4 h-4 text-secondary" />
        </button>

        {/* Executive Profile */}
        <div className="flex items-center gap-sm">
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-bold text-primary font-sans leading-none">Tanya Nepote</span>
            <span className="text-[10px] text-secondary font-mono">Lead Inspector</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center text-white overflow-hidden border border-outline-variant shadow-sm">
            <img 
              alt="Tanya Nepote Profile"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUxcfZoVyUWYeOQMWkT4jQ2Ms_m9KjG3vunG_PIm6-sn46cQ1460It8l0NV3g71GtUO7bGpsRqByu-0TyfXbYbaB9iHcyTDh8jYSe-2qGWdvog4MYYfTFDXwe32twlztvGQ698CgAcwJnQmFe4c_4FDVZH9n_8r7WJ9qGC-g5yltXCeW_5VJvIt74DcGtpWSNBuRAyzAQi8B4bX7Sw6n6drvvLhz8y6PjpaGJQkZOqAnSPXff5pZlU"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
