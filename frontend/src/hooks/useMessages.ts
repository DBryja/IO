import { useState } from 'react';
import { Message, MessageType } from '../types';

export function useMessages() {
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = (text: string, type: MessageType) => {
    setMessage({ text, type });
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const hideMessage = () => {
    setMessage(null);
  };

  return {
    message,
    showMessage,
    hideMessage,
  };
}
