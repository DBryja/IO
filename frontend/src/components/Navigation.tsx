import React from 'react';
import { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'create' as TabType, label: 'Utwórz wydarzenie', icon: 'fas fa-plus-circle' },
  { id: 'manage' as TabType, label: 'Zarządzaj wydarzeniami', icon: 'fas fa-cogs' },
  { id: 'public' as TabType, label: 'Wydarzenia publiczne', icon: 'fas fa-globe' },
  { id: 'stats' as TabType, label: 'Statystyki systemu', icon: 'fas fa-chart-bar' },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="main-nav">
      <div className="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
