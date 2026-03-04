export const DATABASE_NAME = 'loginapp.db' as const

export const TABLES = {
    USER: 'user',
    SESSION: 'session',
    LOGIN_HISTORY: 'login_history'
} as const

export const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000