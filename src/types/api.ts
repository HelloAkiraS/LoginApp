import { LoadingState } from "@/constants/enums";

export type ApiResponse<T> = {
    data: T | null,
    error: string | null,
    state: LoadingState
}

export type AsyncState<T> = {
    data: T | null,
    isLoading: boolean,
    error: string | null
}