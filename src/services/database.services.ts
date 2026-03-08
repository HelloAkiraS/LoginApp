import * as SQLite from 'expo-sqlite'
import { DATABASE_NAME, TABLES } from '@/constants/database'

class DatabaseService {
    /**
     * Typing for the SQLiteDatabase connection object.
     */
    private db: SQLite.SQLiteDatabase | null = null

    /**
     * Typing for the database creation initialization promise in initialize().
     */
    private initPromise: Promise<void> | null = null

    /**
    SINGLETON - Line-by-line explanation:
    -> Goal: To have only one instance of this class throughout the entire program.
    -> Reason: Database connections are expensive resources.
    * By reusing the same instance, we avoid multiple connections and ensure data consistency.
    */

    /**
     * Here we create a place to store the instance.
     * We define that it must ONLY be of this class type (: DatabaseService).
     * -> Same structure as DatabaseService.
     * * We don't want anyone outside this class tampering with our instance, so we keep it private.
     * -> It will only be modified in here. This reduces the risk of the class breaking.
     * * We don't want this property to be accessed via an instance: it is static (STATIONARY) 
     * only for our class!!
     * -> It can only be called from the class itself. This means they won't create a new 
     * instance of the class just to return the value of this property.
     */
    private static instance: DatabaseService | null = null

    /**
     * Since we only want ONE instance, we must control where it is created.
     * * The line below makes it impossible to create a new instance from outside the class.
     * -> Basically, all of this is code consistency to prevent future errors.
     */
    private constructor(){}
    
    /**
     * Returns the SQLiteDatabase type instance.
     * Unlike getInstance(), which is a synchronous function, here we call functions that perform asynchronous processes.
     * * Therefore, we must return a Promise containing a SQLiteDatabase type.
     * -> We are then able to use SQLiteDatabase methods.
     * * We perform a check of the DB connection; in case a connection is needed,
     * we check if initPromise is falsy (null) so that commands and requests 
     * can be sent without the risk of Race Conditions.
     * * Usage: const yourDB = await DatabaseService.getDatabase()
     * * @returns Promise<SQLite.SQLiteDatabase>
     */
    public static async getDatabase(): Promise<SQLite.SQLiteDatabase>{
        const instance = DatabaseService.getInstance()

        if(!instance.db){
            if(!instance.initPromise){
                instance.initPromise = instance.initialize()
            }
            await instance.initPromise
        }
        return instance.db!
    }

    /**
     * Returns the unique instance of DatabaseService (Singleton).
     * * How it works:
     * 1. Checks if an instance has already been created;
     * 2. If falsy, creates a new one using the private constructor;
     * 3. Returns the instance (new or existing).
     * * @returns The unique instance of DatabaseService
     */
    private static getInstance(): DatabaseService {
        if(!DatabaseService.instance) DatabaseService.instance = new DatabaseService()
        
        return DatabaseService.instance
    }

    /**
     * Creates the DATABASE_NAME database and resets the promise.
     * * How it works:
     * 1. Asynchronously creates a database named DATABASE_NAME;
     * 2. Executes the asynchronous function createTables();
     * 3. Catches any error and handles it, indicating that an error occurred in this function and layer;
     * 4. Resets the initPromise value so that getDatabase does not generate a Race Condition.
     * * Usage: private within getDatabase()
     * * @returns Promise<void>
     */
    private async initialize(): Promise<void> {
        try{
            
            this.db = await SQLite.openDatabaseAsync(DATABASE_NAME)
            await this.createTables()

            console.log("✅ DB initialized!")
        }
        catch(error){

            console.error("❌ DB initialization failed:", error)
            throw new Error('Failed to initialize database.')
        }
        finally{

            this.initPromise = null
        }
    }

    /**
     * Private to the DatabaseService class.
     * Checks if the instance's db property is falsy.
     * -> If so, returns the error traceback.
     * -> If not, creates our tables.
     * * @returns Promise<void>
     */
    private async createTables(): Promise<void> {

        if (!this.db) throw new Error('Database not initialized')

        /**
         * Receives a single string of one or more SQL commands, executes them, and returns no results.
         * Optimized for DDL commands.
         * Note: It also works for DML commands that do not require result returns.
         */
        await this.db.execAsync(
            `
            -- Configures the DB to use a .WAL file, allowing concurrent reading and writing.
            -- Recommended by the documentation.
            --
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;
      
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

            -- Indexes for performance on tables with many records
            CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON ${TABLES.SESSION}(user_id);
            CREATE INDEX IF NOT EXISTS idx_history_user_id ON ${TABLES.LOGIN_HISTORY}(user_id);
            `
        )
    }
}

export default DatabaseService