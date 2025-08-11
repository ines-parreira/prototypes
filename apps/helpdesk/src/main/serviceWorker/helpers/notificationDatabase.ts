const DB_NAME = 'notification-dedup'
const DB_VERSION = 1
export const STORE_NAME = 'notifications'

let dbPromise: Promise<IDBDatabase> | null = null

export function getDB(): Promise<IDBDatabase> {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open(DB_NAME, DB_VERSION)

                request.onsuccess = () => {
                    resolve(request.result)
                }

                request.onerror = () => {
                    reject(new Error(`Failed to open DB: ${request.error}`))
                }

                request.onupgradeneeded = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
                    }
                }

                request.onblocked = () => {
                    reject(new Error('Database open blocked'))
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    return dbPromise
}
