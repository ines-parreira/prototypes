import { localForageManager } from '@repo/browser-storage'
import { DurationInMs } from '@repo/utils'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import type { Query } from '@tanstack/react-query'

const STORE_NAME = 'query-cache'

const store = localForageManager.getTable(STORE_NAME)

function getStorageKey(): string {
    const accountId = window.GORGIAS_STATE?.currentAccount?.id ?? ''
    const userId = window.GORGIAS_STATE?.currentUser?.id ?? ''
    return [accountId, userId].join('-')
}

export const PERSIST_MAX_AGE = DurationInMs.OneDay

export function createLocalForageStorage() {
    return {
        getItem: async (key: string) => {
            try {
                const value = await store.getItem<string>(key)
                return value ?? null
            } catch {
                return null
            }
        },
        setItem: async (key: string, value: string) => {
            try {
                await store.setItem(key, value)
            } catch {
                // IndexedDB write failure (quota exceeded, private browsing, etc.)
            }
        },
        removeItem: async (key: string) => {
            try {
                await store.removeItem(key)
            } catch {
                // Ignore cleanup errors
            }
        },
    }
}

export const asyncStoragePersister = createAsyncStoragePersister({
    storage: createLocalForageStorage(),
    key: getStorageKey(),
})

const WHITELISTED_QUERY_KEY_PREFIXES = ['views', 'account']
const BLACKLISTED_QUERY_KEY_OPERATIONS = ['listViewItems']

export function shouldPersistQuery(query: Query): boolean {
    if (query.state.status !== 'success') return false
    if (query.options.cacheTime === 0) return false

    const firstKey = query.queryKey[0]
    if (!WHITELISTED_QUERY_KEY_PREFIXES.includes(firstKey as string))
        return false

    const secondKey = query.queryKey[1]
    if (BLACKLISTED_QUERY_KEY_OPERATIONS.includes(secondKey as string))
        return false

    return true
}

export async function clearPersistedQueryCache(): Promise<void> {
    try {
        await store.removeItem(getStorageKey())
    } catch {
        // Ignore errors during cleanup
    }
}
