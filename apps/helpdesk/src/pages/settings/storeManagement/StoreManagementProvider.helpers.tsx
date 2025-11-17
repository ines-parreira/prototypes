import type { StoreWithAssignedChannels } from './types'

export function sortStoresByName(
    stores: StoreWithAssignedChannels[],
    sortOrder: 'asc' | 'desc',
): StoreWithAssignedChannels[] {
    return [...stores].sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.store.name.localeCompare(b.store.name)
        }
        return b.store.name.localeCompare(a.store.name)
    })
}
