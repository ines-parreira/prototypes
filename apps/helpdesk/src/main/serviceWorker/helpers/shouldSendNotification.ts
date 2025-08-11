import { getDB, STORE_NAME } from './notificationDatabase'

type NotificationRecord = {
    id: string
    timestamp: number
}

export async function shouldSendNotification(id: string): Promise<boolean> {
    try {
        const db = await getDB()

        return new Promise((resolve) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite')
            const store = transaction.objectStore(STORE_NAME)
            const record: NotificationRecord = { id, timestamp: Date.now() }

            const addRequest = store.add(record)

            addRequest.onsuccess = () => {
                resolve(true)
            }

            addRequest.onerror = () => {
                resolve(false)
            }
        })
    } catch {
        return true
    }
}
