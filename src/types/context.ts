import { AuthStatus } from "@/constants/enums"
import { TUserPublic } from "./user"

export type TAuthState = {
    user: TUserPublic,
    sessionId: string | null,
    status: AuthStatus,
    isLoading: boolean,
    error: string | null
}

export type TAuthActions = {
    login: (email: string, password: string) => Promise<void>,
    register: (email: string, password: string) => Promise<void>,
    logout: () => Promise<void>,
    checkAuth: () => Promise<void>
}

export type TAuthContext = TAuthState & TAuthActions