export type TUser = {
    id: string | null, //uuid
    email: string,
    password: string, //hash
    createdAt: number //unix timestamp
}

export type TSession = {
    id: string,
    userId: string, //FK
    createdAt: number,
    expiresAt: number //timeout
}

export type TUserCreateInput = Omit<TUser, 'id' | 'createdAt'>

export type TUserPublic = Pick<TUser, 'id' | 'email' | 'createdAt'> | null