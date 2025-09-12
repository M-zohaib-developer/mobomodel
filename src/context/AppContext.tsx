import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  AppState,
  User,
  Device,
  Order,
  Technician,
  Report,
  AppSettings,
  QCReview,
  TechnicianReview,
  ClearanceReview,
  InventoryReview,
  RoleThemePayload,
} from "../types";

type AppAction =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppSettings> }
  | {
      type: "UPDATE_ROLE_THEME";
      payload: {
        role: "client" | "enterprise" | "admin";
        theme: "light" | "dark";
      };
    }
  | { type: "SET_CURRENT_PAGE"; payload: string }
  | { type: "ADD_DEVICE"; payload: Device }
  | { type: "UPDATE_DEVICE"; payload: Device }
  | { type: "DELETE_DEVICE"; payload: string }
  | { type: "ADD_ORDER"; payload: Order }
  | { type: "UPDATE_ORDER"; payload: Order }
  | { type: "ADD_TECHNICIAN"; payload: Technician }
  | { type: "UPDATE_TECHNICIAN"; payload: Technician }
  | { type: "DELETE_TECHNICIAN"; payload: string }
  | { type: "ADD_REPORT"; payload: Report }
  | { type: "UPDATE_REPORT"; payload: Report }
  | { type: "ADD_QC_REVIEW"; payload: QCReview }
  | { type: "ADD_TECHNICIAN_REVIEW"; payload: TechnicianReview }
  | { type: "ADD_CLEARANCE_REVIEW"; payload: ClearanceReview }
  | { type: "ADD_INVENTORY_REVIEW"; payload: InventoryReview }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "ADD_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string }
  | { type: "SET_ROLE_THEMES"; payload: Record<string, RoleThemePayload> }
  | { type: "INITIALIZE_STATE"; payload: AppState };

const initialState: AppState = {
  isAuthenticated: false,
  currentUser: null,
  users: [
    {
      id: "1",
      email: "client@gmail.com",
      name: "John Client",
      role: "client",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      email: "enterprise@gmail.com",
      name: "TechCorp Enterprise",
      role: "enterprise",
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      email: "admin@gmail.com",
      name: "System Admin",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
  ],
  // ✅ Hydrate devices & orders from localStorage
  devices: JSON.parse(localStorage.getItem("devices") || "[]"),
  orders: JSON.parse(localStorage.getItem("orders") || "[]"),

  technicians: [
    {
      id: "1",
      name: "Mike Johnson",
      email: "mike@mobocheck.com",
      specialization: "Screen Repair",
      assignedDevices: [],
      completedDevices: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Sarah Wilson",
      email: "sarah@mobocheck.com",
      specialization: "Battery Replacement",
      assignedDevices: [],
      completedDevices: 0,
      createdAt: new Date().toISOString(),
    },
  ],
  reports: [],
  qcReviews: [],
  technicianReviews: [],
  clearanceReviews: [],
  inventoryReviews: [],
  settings: {
    theme: "light",
    notifications: true,
    autoSave: true,
    language: "en",
    clientTheme: "light",
    enterpriseTheme: "light",
    adminTheme: "light",
  },
  currentPage: "dashboard",
};

function mapDeviceToOrderStatus(deviceStatus: string) {
  // map internal device statuses to order statuses (adjust labels to your app if needed)
  switch (deviceStatus) {
    case "qc":
      return "in-progress";
    case "technician":
      return "in-progress";
    case "inventory":
      return "in-progress";
    case "clearance":
      return "in-progress";
    case "completed":
      return "completed";
    case "failed":
      return "pending";
    default:
      return deviceStatus;
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "INITIALIZE_STATE":
      return action.payload;
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        currentUser: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        currentUser: null,
        currentPage: "login",
      };
    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case "UPDATE_ROLE_THEME": {
      const { role, theme } = action.payload;
      const roleThemeKey = `${role}Theme` as keyof AppSettings;
      return {
        ...state,
        settings: {
          ...state.settings,
          [roleThemeKey]: theme,
          // Update global theme if current user matches the role
          theme:
            state.currentUser?.role === role ? theme : state.settings.theme,
        },
      };
    }

    case "SET_ROLE_THEMES":
      return {
        ...state,
        roleThemes: action.payload,
      };
    case "SET_CURRENT_PAGE":
      return {
        ...state,
        currentPage: action.payload,
      };
    case "ADD_DEVICE":
      return {
        ...state,
        devices: [...state.devices, action.payload],
      };
    case "UPDATE_DEVICE": {
      const updatedDevice = action.payload as Device;

      // update devices list
      const devices = Array.isArray(state.devices)
        ? state.devices.map((d) =>
            d.id === updatedDevice.id ? updatedDevice : d
          )
        : [updatedDevice];

      // update related order status (if device belongs to an order)
      let orders = Array.isArray(state.orders) ? [...state.orders] : [];
      if (updatedDevice.orderId) {
        orders = orders.map((o) =>
          o.id === updatedDevice.orderId
            ? {
                ...o,
                status: mapDeviceToOrderStatus(updatedDevice.status),
                updatedAt: new Date().toISOString(),
              }
            : o
        );
      }

      // persist
      try {
        localStorage.setItem("devices", JSON.stringify(devices));
        localStorage.setItem("orders", JSON.stringify(orders));
      } catch (e) {
        // ignore storage errors
      }

      return { ...state, devices, orders };
    }
    case "DELETE_DEVICE":
      return {
        ...state,
        devices: state.devices.filter((device) => device.id !== action.payload),
      };
    case "ADD_ORDER":
      return {
        ...state,
        orders: [...state.orders, action.payload],
      };
    case "UPDATE_ORDER":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.id ? action.payload : order
        ),
      };
    case "ADD_TECHNICIAN":
      return {
        ...state,
        technicians: [...state.technicians, action.payload],
      };
    case "UPDATE_TECHNICIAN":
      return {
        ...state,
        technicians: state.technicians.map((tech) =>
          tech.id === action.payload.id ? action.payload : tech
        ),
      };
    case "DELETE_TECHNICIAN":
      return {
        ...state,
        technicians: state.technicians.filter(
          (tech) => tech.id !== action.payload
        ),
      };
    case "ADD_REPORT": {
      const report = action.payload as Report;
      const reports = Array.isArray(state.reports)
        ? [...state.reports, report]
        : [report];

      try {
        localStorage.setItem("reports", JSON.stringify(reports));
      } catch (err) {
        console.error("Failed to persist reports", err);
      }

      return { ...state, reports };
    }
    case "UPDATE_REPORT":
      return {
        ...state,
        reports: state.reports.map((report) =>
          report.id === action.payload.id ? action.payload : report
        ),
      };
    case "ADD_QC_REVIEW":
      return {
        ...state,
        qcReviews: [...state.qcReviews, action.payload],
      };
    case "ADD_TECHNICIAN_REVIEW":
      return {
        ...state,
        technicianReviews: [...state.technicianReviews, action.payload],
      };
    case "ADD_CLEARANCE_REVIEW":
      return {
        ...state,
        clearanceReviews: [...state.clearanceReviews, action.payload],
      };
    case "ADD_INVENTORY_REVIEW":
      return {
        ...state,
        inventoryReviews: [...state.inventoryReviews, action.payload],
      };
    case "UPDATE_USER":
      return {
        ...state,
        currentUser: state.currentUser
          ? { ...state.currentUser, ...action.payload }
          : null,
        users: state.users.map((user) =>
          user.id === state.currentUser?.id
            ? { ...user, ...action.payload }
            : user
        ),
      };
    case "ADD_USER":
      return {
        ...state,
        users: [...state.users, action.payload],
      };
    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  setRoleTheme?: (role: string, payload: RoleThemePayload) => void;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Apply CSS variables for a given payload
  const applyRoleCssVars = (payload?: RoleThemePayload) => {
    if (!payload) return;
    const root = document.documentElement;
    if (payload.navbarBg)
      root.style.setProperty("--app-navbar-bg", payload.navbarBg);
    if (payload.btnBg) root.style.setProperty("--app-btn-bg", payload.btnBg);
    if (payload.cardBg) root.style.setProperty("--app-card-bg", payload.cardBg);
    if (payload.bodyBg) root.style.setProperty("--app-body-bg", payload.bodyBg);
    if (payload.textColor)
      root.style.setProperty("--app-text-color", payload.textColor);
    if (payload.backgroundImage)
      root.style.setProperty(
        "--app-bg-image",
        `url(${payload.backgroundImage})`
      );
    if (payload.theme === "dark") {
      document.documentElement.setAttribute("data-app-theme", "dark");
    } else if (payload.theme === "light") {
      document.documentElement.removeAttribute("data-app-theme");
    }
  };

  // Persist and apply a role-scoped theme
  const setRoleTheme = (role: string, payload: RoleThemePayload) => {
    try {
      const roleThemes: Record<string, RoleThemePayload> = JSON.parse(
        localStorage.getItem("roleThemes") || "{}"
      );
      roleThemes[role] = payload;
      localStorage.setItem("roleThemes", JSON.stringify(roleThemes));
      // update in-memory state
      dispatch({ type: "SET_ROLE_THEMES", payload: roleThemes });
      // apply immediately if current user matches role
      if (state.currentUser?.role === role) {
        applyRoleCssVars(payload);
      }
    } catch (err) {
      console.error("Failed to persist role theme", err);
    }
  };

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("mobocheck-state");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: "INITIALIZE_STATE", payload: parsedState });
      } catch (error) {
        console.error("Error loading state from localStorage:", error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("mobocheck-state", JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch, setRoleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

// Helper function to get the current theme based on user role
export function useCurrentTheme() {
  const { state } = useApp();
  const { currentUser, settings } = state;

  if (!currentUser) {
    return settings.theme;
  }

  switch (currentUser.role) {
    case "client":
      return settings.clientTheme || settings.theme;
    case "enterprise":
      return settings.enterpriseTheme || settings.theme;
    case "admin":
      return settings.adminTheme || settings.theme;
    default:
      return settings.theme;
  }
}
