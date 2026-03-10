import { SESSION_DURATION, TABLES } from "@/constants/database";
import { ApiResponse } from "@/types/api";
import { TSession } from "@/types/user";
import DatabaseService from "./database.service";
import uuid from "react-native-uuid"
import { LoadingState } from "@/constants/enums";

class SessionService {

    async createSession(userId: string | null ): Promise<ApiResponse<TSession>>{
        try{
            const db = await DatabaseService.getDatabase()

            const SessionId = uuid.v4() as string
            const now = Date.now()
            const expiresAt = now + SESSION_DURATION

            await db.runAsync(
                `
                INSERT INTO ${TABLES.SESSION}
                    (id, userId, created_at, expires_at)
                    VALUES (?, ?, ?, ?)
                `,
                [SessionId, userId, now, expiresAt]
            )

            const session: TSession = {
                id: SessionId,
                userId: userId,
                createdAt: now,
                expiresAt: expiresAt
            }

            return {
                data: session,
                error: null,
                state: LoadingState.SUCCESS
            }
        }
        catch(error){
            console.error("Error creating a session.")

            const errorMessage = error instanceof Error ? error.message : String(error)

            return{
                data: null,
                error: "Error creating a session: " + errorMessage,
                state: LoadingState.ERROR
            }
        }
        
    }

    async validateSession(SessionId: string): Promise<ApiResponse<TSession | null>>{
        try{
            const db = await DatabaseService.getDatabase()
            const now = Date.now()

            const session = await db.getFirstAsync<TSession>(
                `
                SELECT * FROM ${TABLES.SESSION}
                    WHERE id = ?
                    and expires_at = ?
                    LIMIT 1
                `,
                [SessionId, now]
            )

            if(!session){

                await this.cleanupExpiredSessions()

                return{
                    data: null,
                    error: "",
                    state: LoadingState.ERROR
                }
            }

            return{
                data: session,
                error: null,
                state: LoadingState.SUCCESS
            }

        }
        catch(error){
            console.error("Error validating session.")

            const errorMessage = error instanceof Error ? error.message : String(error)
            
            return{
                data: null,
                error: "Error validating session: " + errorMessage,
                state: LoadingState.ERROR
            }
        }
    }

    async deleteSession(SessionId: string): Promise<ApiResponse<TSession | null>>{
        try{
            const db = await DatabaseService.getDatabase()

            await db.runAsync(
                `
                DELETE FROM ${TABLES.SESSION}
                    WHERE id = ?
                `,
                [SessionId]
            )

            return{
                data: null,
                error: null,
                state: LoadingState.SUCCESS
            }

        }catch(error){
            console.error("Error deleting session.")

            const errorMessage = error instanceof Error ? error.message : String(error)
            
            return{
                data: null,
                error: "Error deleting session: " + errorMessage,
                state: LoadingState.ERROR
            }
        }
    }

    async cleanupExpiredSessions(): Promise<void>{
        try{
            const db = await DatabaseService.getDatabase()
            const now = Date.now()

            await db.runAsync(
                `
                DELETE FROM ${TABLES.SESSION}
                    WHERE expires_at <= ?
                `,
                [now]
            )
        }
        catch(error){
            console.error("Error cleaning up sessions.")
        }
    }

    async getLatestValidSession(): Promise<ApiResponse<TSession | null>>{
        try{
            const db = await DatabaseService.getDatabase()
            const now = Date.now()

            const session = await db.getFirstAsync<TSession>(
                `
                SELECT * FROM ${TABLES.SESSION}
                    WHERE expires_at > ?
                    ORDER BY created_at DESC
                    LIMIT 1
                `,
                [now]
            )

            return{
                data: session || null, //session can return null if consult not exists in db
                error: null,
                state: LoadingState.SUCCESS
            }
        }
        catch(error){
            console.error("Error validating session.")

            const errorMessage = error instanceof Error ? error.message : String(error)
            
            return{
                data: null,
                error: "Error validating session: " + errorMessage,
                state: LoadingState.ERROR
            }
        }
    }
}

export default new SessionService()