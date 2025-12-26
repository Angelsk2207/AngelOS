
export enum WindowType {
  TERMINAL = 'TERMINAL',
  DASHBOARD = 'DASHBOARD',
  EXPLORER = 'EXPLORER',
  AI_CHAT = 'AI_CHAT',
  SYSTEM_LOGS = 'SYSTEM_LOGS'
}

export interface WindowState {
  id: string;
  type: WindowType;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'system';
  message: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AIResponse {
  text: string;
  sources: GroundingSource[];
}
