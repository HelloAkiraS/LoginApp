import * as SQLite from 'expo-sqlite'
import { DATABASE_NAME, TABLES } from '@/constants/database'

class DatabaseService {
    private constructor(){} //Does not allow DatabaseService's methods being called publicly
    private db: SQLite.SQLiteDatabase | null = null //DB Conection Property

    //Class Singleton Verification
    private static instance: DatabaseService
    public static getInstance(): DatabaseService {
        if(!DatabaseService.instance) DatabaseService.instance = new DatabaseService()
        
        return DatabaseService.instance
    }

    async initialize(): Promise<void> {
        try{
            
            this.db = await SQLite.openDatabaseAsync(DATABASE_NAME)
            await this.createTables()

            console.log("✅ DB initialized!")
        }catch(e){
            console.error("❌ DB initialization failed:", e)
            throw new Error('Failed to initialize database.')
        }
    }

    private async createTables(): Promise<void> {

        if (!this.db) throw new Error('Database not initialized')

        //Transaction
        await this.db.execAsync(
            `
            PRAGMA journal_mode = WAL;
      
            CREATE TABLE IF NOT EXISTS ${TABLES.USER} (
                id TEXT PRIMARY KEY NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS ${TABLES.SESSION} (
                id TEXT PRIMARY KEY NOT NULL,
                user_id TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES ${TABLES.USER}(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS ${TABLES.LOGIN_HISTORY} (
                id TEXT PRIMARY KEY NOT NULL,
                user_id TEXT NOT NULL,
                logged_at INTEGER NOT NULL,
                device_info TEXT,
                FOREIGN KEY (user_id) REFERENCES ${TABLES.USER}(id) ON DELETE CASCADE
            );

            -- Índices para performance
            CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON ${TABLES.SESSION}(user_id);
            CREATE INDEX IF NOT EXISTS idx_history_user_id ON ${TABLES.LOGIN_HISTORY}(user_id);
            `
        )
    }

    async getDatabase(): Promise<SQLite.SQLiteDatabase>{
        if(!this.db) await  this.initialize()

        return this.db!
    }
}

export default DatabaseService.getInstance()