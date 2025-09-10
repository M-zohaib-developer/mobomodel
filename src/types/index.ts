export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'enterprise' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface Device {
  id: string;
  brand: string;
  model: string;
  imei: string;
  reportedIssue: string;
  status: 'pending' | 'qc' | 'technician-diagnosis' | 'cleaning' | 'completed';
  clientId: string;
  technicianId?: string;
  notes: string[];
  estimate?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Order {
  id: string;
  clientId: string;
  devices: Device[];
  totalDevices: number;
  completedDevices: number;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  specialization: string;
  assignedDevices: string[];
  completedDevices: number;
  createdAt: string;
}

export interface Report {
  id: string;
  deviceId: string;
  orderId: string;
  summary: string;
  workDone: string[];
  partsReplaced: string[];
  finalStatus: string;
  technicianNotes: string;
  createdAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  autoSave: boolean;
  language: string;
}

export interface AppState {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  devices: Device[];
  orders: Order[];
  technicians: Technician[];
  reports: Report[];
  settings: AppSettings;
  currentPage: string;
}