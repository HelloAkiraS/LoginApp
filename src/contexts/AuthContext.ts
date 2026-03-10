import { AuthStatus } from "@/constants/enums";
import SessionService from "@/services/session.service";
import UserService from "@/services/user.service";
import { TAuthContext, TAuthState } from "@/types/context";
import { createContext, useCallback, useState } from "react";

const AuthContext = createContext<TAuthContext>(undefined as any)

export function AuthProvider({ children }: { children: React.ReactNode }){

    /**
     * 
     */
    const [ authState, setAuthState ] = useState<TAuthState>(
        {
            user: null,
            sessionId: null,
            status: AuthStatus.IDLE,
            isLoading: false,
            error: null
        }
    )

    /**
     * 
     */
    const login = useCallback(
        async (email: string, password: string) => {
            
            setAuthState(
                prev => (
                    {
                        ...prev,
                        isLoading: true,
                        error: null,
                        status: AuthStatus.LOADING
                    }
            ))

            try{
                const userResponse = await UserService.validateCredentials(email, password)

                if(!userResponse.data){
                    throw new Error(userResponse.error || "Credenciais inválidas")
                }

                const sessionResponse = await SessionService.createSession(userResponse.data.id)

                if(!sessionResponse.data) throw new Error(sessionResponse.error || "E")
            }
            catch(error){

            }
        }
    )


    /**
     * 
     */

}