import { LoadingState } from "@/constants/enums";

export type ApiResponse<Generic> = {
    data: Generic | null,
    error: string | null,
    state: LoadingState
}

export type AsyncState<Generic> = {
    data: Generic | null,
    isLoading: boolean,
    error: string | null
}