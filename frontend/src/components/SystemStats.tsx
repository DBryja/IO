import React from 'react';
import { SystemStats as SystemStatsType } from '../types';
import { useSystemStats } from '../hooks/useData';

interface SystemStatsProps {
  onMessage: (text: string, type: 'success' | 'error' | 'info') => void;
}

export function SystemStatsComponent({ onMessage }: SystemStatsProps) {
  const { stats, loading, refetch } = useSystemStats();

  if (loading) {
    return (
      <div className="tab-content">
        <h2>
          <i className="fas fa-chart-bar"></i>
          Statystyki systemu
        </h2>
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i> Ładowanie statystyk...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="tab-content">
        <h2>
          <i className="fas fa-chart-bar"></i>
          Statystyki systemu
        </h2>
        <div className="empty-state">
          <i className="fas fa-exclamation-circle"></i>
          <h3>Błąd ładowania statystyk</h3>
          <button className="btn btn-primary" onClick={refetch}>
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <h2>
        <i className="fas fa-chart-bar"></i>
        Statystyki systemu
      </h2>
        <div className="section-description">
        <p>
          <i className="fas fa-chart-bar"></i>
          Podstawowe statystyki systemu zarządzania wydarzeniami.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-calendar"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalEvents || 0}</div>
            <div className="stat-label">Wszystkich wydarzeń</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon published">
            <i className="fas fa-paper-plane"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.publishedEvents || 0}</div>
            <div className="stat-label">Opublikowanych</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon draft">
            <i className="fas fa-edit"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.draftEvents || 0}</div>
            <div className="stat-label">Szkiców</div>
          </div>
        </div>
      </div>

      <div className="refresh-section">
        <button className="btn btn-secondary" onClick={refetch}>
          <i className="fas fa-sync-alt"></i>
          Odśwież statystyki
        </button>
      </div>
    </div>
  );
}
