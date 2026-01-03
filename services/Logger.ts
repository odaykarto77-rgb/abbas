
import { LogEntry } from '../types';
import { Storage } from './Storage';

export const Logger = {
  log: (event: string, level: LogEntry['level'] = 'INFO', userId?: string, details?: string) => {
    const logs: LogEntry[] = JSON.parse(Storage.get('logs') || '[]');
    const newLog: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      level,
      event,
      userId,
      details
    };
    
    // Keep only last 200 logs to prevent storage bloat
    const updatedLogs = [newLog, ...logs].slice(0, 200);
    Storage.set('logs', JSON.stringify(updatedLogs));
    
    console.log(`[TERMINAL LOG] ${level}: ${event}`, details || '');
  },

  getLogs: (): LogEntry[] => {
    return JSON.parse(Storage.get('logs') || '[]');
  },

  clear: () => {
    Storage.set('logs', JSON.stringify([]));
  }
};
