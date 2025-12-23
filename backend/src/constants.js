export const DB_NAME = 'task_management_db'

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user'
}

// Task Status
export const TASK_STATUS = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    REVIEW: 'REVIEW',
    DONE: 'DONE'
}

// Task Priority
export const TASK_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
}

// Audit Actions
export const AUDIT_ACTIONS = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    STATUS_CHANGE: 'STATUS_CHANGE',
    ASSIGN: 'ASSIGN'
}

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100