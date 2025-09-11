export interface User {
  id: string;
  email: string;
  name: string;
  role: "client" | "enterprise" | "admin";
  avatar?: string;
  createdAt: string;
}

export interface Device {
  id: string;
  brand: string;
  model: string;
  imei: string;
  reportedIssue: string;
  status:
    | "pending"
    | "qc"
    | "qc-rejected"
    | "technician"
    | "technician-rejected"
    | "repair-qc"
    | "clearance"
    | "completed"
    | "inventory";
  clientId: string;
  technicianId?: string;
  qcId?: string;
  clearanceId?: string;
  inventoryId?: string;
  notes: string[];
  qcNotes?: string[];
  technicianNotes?: string[];
  clearanceNotes?: string[];
  inventoryNotes?: string[];
  estimate?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  qcDate?: string;
  technicianDate?: string;
  clearanceDate?: string;
  inventoryDate?: string;
}

export interface Order {
  id: string;
  clientId: string;
  devices: Device[];
  totalDevices: number;
  completedDevices: number;
  status: "pending" | "in-progress" | "completed";
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
  clientId: string;
  summary: string;
  workDone: string[];
  partsReplaced: string[];
  finalStatus: string;
  technicianNotes: string;
  qcNotes?: string;
  clearanceNotes?: string;
  generatedBy: string; // enterprise user who generated the report
  createdAt: string;
  submittedAt?: string;
  status: "draft" | "submitted" | "approved";
}

export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface QCReview {
  id: string;
  deviceId: string;
  orderId: string;
  qcId: string;
  status: "approved" | "rejected";
  notes: string;
  createdAt: string;
}

export interface TechnicianReview {
  id: string;
  deviceId: string;
  orderId: string;
  technicianId: string;
  status: "approved" | "rejected";
  notes: string;
  createdAt: string;
}

export interface ClearanceReview {
  id: string;
  deviceId: string;
  orderId: string;
  clearanceId: string;
  status: "approved" | "rejected";
  notes: string;
  createdAt: string;
}

export interface InventoryReview {
  id: string;
  deviceId: string;
  orderId: string;
  inventoryId: string;
  status: "approved" | "rejected";
  notes: string;
  createdAt: string;
}

export interface AppSettings {
  theme: "light" | "dark";
  notifications: boolean;
  autoSave: boolean;
  language: string;
  // Role-based theme settings
  clientTheme?: "light" | "dark";
  enterpriseTheme?: "light" | "dark";
  adminTheme?: "light" | "dark";
}

export interface AppState {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  devices: Device[];
  orders: Order[];
  technicians: Technician[];
  reports: Report[];
  qcReviews: QCReview[];
  technicianReviews: TechnicianReview[];
  clearanceReviews: ClearanceReview[];
  inventoryReviews: InventoryReview[];
  settings: AppSettings;
  currentPage: string;
}
