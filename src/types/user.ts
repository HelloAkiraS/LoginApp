export type User = {
    id: string, //uuid
    email: string,
    password: string, //hash
    createdAt: number //unix timestamp
}

export type Session = {
    id: string,
    userId: string, //FK
    createdAt: number,
    expiresAt: number //timeout
}

export type UserCreateInput = Omit<User, 'id' | 'createdAt'>

export type UserPublic = Pick<User, 'id' | 'email' | 'createdAt'>