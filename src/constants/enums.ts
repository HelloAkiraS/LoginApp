export enum AuthStatus {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    AUTHENTICATED = 'AUTHENTICATED',
    UNAUTHENTICATED = 'UNAUTHENTICATED'
}

export enum LoadingState {
    IDLE = 'IDLE',
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

// TODO Search about Union Types and how would they impact the project from this file.