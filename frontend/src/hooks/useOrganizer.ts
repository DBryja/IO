import { useState, useEffect } from 'react';

export function useOrganizer() {
  const [organizerId, setOrganizerId] = useState<string>('');

  useEffect(() => {
    // Get or generate organizer ID
    let storedId = localStorage.getItem('organizerId');
    if (!storedId) {
      storedId = 'organizer-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('organizerId', storedId);
    }
    setOrganizerId(storedId);
  }, []);

  const changeOrganizer = () => {
    const newId = 'organizer-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('organizerId', newId);
    setOrganizerId(newId);
    window.location.reload(); // Refresh to reset app state
  };

  return {
    organizerId,
    changeOrganizer,
  };
}
