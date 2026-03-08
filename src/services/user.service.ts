import { UserCreateInput, UserPublic, User } from "@/types/user";
import DatabaseService from "./database.services";
import { ApiResponse } from "@/types/api";
import uuid from "react-native-uuid"
import { TABLES } from "@/constants/database";
import { LoadingState } from "@/constants/enums";
import * as bcrypt from "bcrypt"

/**
 * Service responsible for user management, persistence, and authentication logic.
 * Interacts with the local SQLite database via DatabaseService.
 */
class UserService {
    /**
     * Registers a new user with a hashed password.
     * * @description Hashes the password, generates a unique ID, and stores the user.
     * * @throws Will return an error state if the email is already registered.
     */
    async createUser(input: UserCreateInput): Promise<ApiResponse<UserPublic>> {
        try {
            const db = await DatabaseService.getDatabase()
            const userId = uuid.v4() as string
            const now = Date.now()
            const hashedPassword = await this.hashPassword(input.password)

            await db.runAsync(
                `INSERT INTO ${TABLES.USER} (id, email, password, createdAt) VALUES (?, ?, ?, ?)`,
                [userId, input.email, hashedPassword, now]
            )

            const userPublic: UserPublic = {
                id: userId,
                email: input.email,
                createdAt: now
            }

            return { data: userPublic, error: null, state: LoadingState.SUCCESS }
        } catch (error) {
            console.error("Error creating user: ", error)

            const errorMessage = error instanceof Error ? error.message : String(error)
            
            // Handle unique constraint violation (Database level email uniqueness)
            if (errorMessage.includes("UNIQUE")) {
                return {
                    data: null,
                    error: `${input.email} já foi cadastrado!`,
                    state: LoadingState.ERROR
                }
            }
            return {
                data: null,
                error: "Erro ao criar usuário.",
                state: LoadingState.ERROR
            }
        }
    }

    /**
     * Transforms plaintext password into a stored hash format.
     * @TODO Eventually upgrade to Argon2. Needed: server side!
     */
    private async hashPassword(password: string): Promise<string> {
        const salt = 15
        const hash = await bcrypt.hash(password, salt)

        return hash
    }

    /**
     * Retrieves a full user record (including sensitive fields) by email.
     * Returns `null` if no user matches the criteria.
     */
    async getUserByEmail(email: string): Promise<ApiResponse<User>> {
        try {
            const db = await DatabaseService.getDatabase()

            const result = await db.getFirstAsync<User>(
                `SELECT * FROM ${TABLES.USER} WHERE email = ? LIMIT 1`,
                [email]
            )

            return {
                data: result || null,
                error: null,
                state: LoadingState.SUCCESS
            }
        } catch (error) {
            console.error("Error fetching user:", error)
            return {
                data: null,
                error: "Error fetching user :/",
                state: LoadingState.ERROR
            }
        }
    }

    /**
     * Verifies user identity against stored credentials.
     * * @description Returns a generic error message for both "not found" and "wrong password"
     * to prevent account enumeration attacks.
     */
    async validateCredentials(email: string, password: string): Promise<ApiResponse<UserPublic | null>> {
        try {
            const userResponse = await this.getUserByEmail(email)
            const user = userResponse.data

            if (!user) {
                return {
                    data: null,
                    error: "Incorrect email or password",
                    state: LoadingState.ERROR
                }
            }
            
            const isValid = await this.verifyPassword(password, user.password)

            if (!isValid) {
                return {
                    data: null,
                    error: "Incorrect email or password",
                    state: LoadingState.ERROR
                }
            }

            const userPublic: UserPublic = {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt
            }

            return {
                data: userPublic,
                error: null,
                state: LoadingState.SUCCESS
            }
        } catch (error) {
            console.error("Credential validation error: ", error)
            return {
                data: null,
                error: "Credential validation error :/",
                state: LoadingState.ERROR
            }
        }
    }

    /**
     * Compares a raw password against a stored hash.
     */
    async verifyPassword(plaintext: string, hash: string): Promise<boolean> {
        const storedHash = await this.hashPassword(plaintext)
        return storedHash === hash
    }
}

export default new UserService()