import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { MessageDisplay } from './components/MessageDisplay';
import { CreateEventForm } from './components/CreateEventForm';
import { OrganizerEvents } from './components/OrganizerEvents';
import { PublicEvents } from './components/PublicEvents';
import { SystemStatsComponent } from './components/SystemStats';
import { useOrganizer } from './hooks/useOrganizer';
import { useMessages } from './hooks/useMessages';
import { eventApi } from './services/eventApi';
import { TabType } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [isLoading, setIsLoading] = useState(false);
  const { organizerId, changeOrganizer } = useOrganizer();
  const { message, showMessage, hideMessage } = useMessages();

  console.log('🎯 App component rendering, organizerId:', organizerId);

  const handleCreateEvent = async (eventData: any) => {
    setIsLoading(true);
    try {
      showMessage('Tworzenie wydarzenia...', 'info');
      
      const response = await eventApi.createEvent(eventData);
      
      if (response.success) {
        showMessage('✅ Wydarzenie zostało utworzone pomyślnie!', 'success');
        // Switch to management tab to show the new event
        setActiveTab('manage');
      } else {
        showMessage(`❌ Błąd: ${response.error}`, 'error');
      }
    } catch (error) {
      showMessage(`❌ Błąd sieci: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    console.log('📋 Rendering tab content for:', activeTab);
    
    try {
      switch (activeTab) {
        case 'create':
          return (
            <CreateEventForm
              organizerId={organizerId}
              onSubmit={handleCreateEvent}
              isLoading={isLoading}
            />
          );
        case 'manage':
          return (
            <OrganizerEvents
              organizerId={organizerId}
              onMessage={showMessage}
            />
          );
        case 'public':
          return (
            <PublicEvents
              onMessage={showMessage}
            />
          );
        case 'stats':
          return (
            <SystemStatsComponent
              onMessage={showMessage}
            />
          );
        default:
          return <div>Nieznana zakładka: {activeTab}</div>;
      }
    } catch (error) {
      console.error('❌ Error rendering tab content:', error);
      return (
        <div className="error-state">
          <h3>Błąd ładowania zawartości</h3>
          <p>Szczegóły: {String(error)}</p>
        </div>
      );
    }
  };

  if (!organizerId) {
    return (
      <div className="loading">
        <i className="fas fa-spinner fa-spin"></i> Inicjalizacja...
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        organizerId={organizerId}
        onChangeOrganizer={changeOrganizer}
      />
      
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <main className="main-content">
        <MessageDisplay
          message={message}
          onClose={hideMessage}
        />
        
        {renderTabContent()}
      </main>
    </div>
  );
}
