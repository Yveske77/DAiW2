export interface TimelinePoint {
  time: number; // 0 to 100 representing percentage
  value: number; // 0 to 100
}

export interface Curve {
  id: string;
  name: string;
  color: string;
  points: TimelinePoint[];
}

export interface NodeBlock {
  id: string;
  type: 'context' | 'genre' | 'instrument' | 'effect' | 'output' | 'lyrics';
  name: string;
  step: number;
  data: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  attachments?: { type: 'image' | 'audio'; url: string }[];
  timestamp: number;
}

export enum ViewMode {
  BUILDER = 'BUILDER',
  TIMELINE = 'TIMELINE'
}

export interface Project {
  id: string;
  name: string;
  bpm: number;
  key: string;
  nodes: NodeBlock[];
  curves: Curve[];
}

export type ImageSize = '1K' | '2K' | '4K';