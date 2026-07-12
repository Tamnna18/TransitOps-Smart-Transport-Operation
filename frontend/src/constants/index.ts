export const ROLES = {
  MANAGER: "MANAGER",
  DRIVER: "DRIVER",
  SAFETY: "SAFETY",
  ANALYST: "ANALYST",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const VEHICLE_STATUSES = {
  ACTIVE: "ACTIVE",
  IN_SERVICE: "IN_SERVICE",
  MAINTENANCE: "MAINTENANCE",
  OUT_OF_SERVICE: "OUT_OF_SERVICE",
} as const;

export type VehicleStatus = typeof VEHICLE_STATUSES[keyof typeof VEHICLE_STATUSES];

export const DRIVER_STATUSES = {
  AVAILABLE: "AVAILABLE",
  IN_TRANSIT: "IN_TRANSIT",
  ON_REST: "ON_REST",
  SUSPENDED: "SUSPENDED",
} as const;

export type DriverStatus = typeof DRIVER_STATUSES[keyof typeof DRIVER_STATUSES];

export const TRIP_STATUSES = {
  SCHEDULED: "SCHEDULED",
  IN_TRANSIT: "IN_TRANSIT",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type TripStatus = typeof TRIP_STATUSES[keyof typeof TRIP_STATUSES];

export const EXPENSE_CATEGORIES = {
  TOLL: "TOLL",
  LODGING: "LODGING",
  MEALS: "MEALS",
  PERMIT: "PERMIT",
  OTHER: "OTHER",
} as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[keyof typeof EXPENSE_CATEGORIES];

export const APPROVAL_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ApprovalStatus = typeof APPROVAL_STATUSES[keyof typeof APPROVAL_STATUSES];

export const DOCUMENT_TYPES = {
  INSURANCE: "INSURANCE",
  REGISTRATION: "REGISTRATION",
  EMISSIONS: "EMISSIONS",
  LICENSE: "LICENSE",
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

export const APP_STORAGE_KEYS = {
  AUTH_TOKEN: "transitops_auth_token",
  THEME: "transitops_theme",
  SIDEBAR_COLLAPSED: "transitops_sidebar_collapsed",
} as const;
