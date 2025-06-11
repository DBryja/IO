import React from 'react';
import { Message } from '../types';

interface MessageDisplayProps {
  message: Message | null;
  onClose: () => void;
}

export function MessageDisplay({ message, onClose }: MessageDisplayProps) {
  if (!message) return null;

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-info-circle';
    }
  };

  return (
    <div className={`message ${message.type}`}>
      <i className={getIcon()}></i>
      <span>{message.text}</span>
      <button className="message-close" onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}
