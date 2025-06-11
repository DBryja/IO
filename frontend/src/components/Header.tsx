import React from 'react';

interface HeaderProps {
  organizerId: string;
  onChangeOrganizer: () => void;
}

export function Header({ organizerId, onChangeOrganizer }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h1>🎉 Event Management System</h1>
          <p>SQLite CQRS Architecture</p>
        </div>
        <div className="organizer-info">
          <span className="organizer-label">Organizator:</span>
          <span className="organizer-id" id="organizer-name">
            {organizerId}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onChangeOrganizer}
            title="Zmień organizatora"
          >
            <i className="fas fa-user-edit"></i> Zmień
          </button>
        </div>
      </div>
    </header>
  );
}
