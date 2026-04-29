/**
 * Removes the "(current)" suffix from a store name
 */
export function cleanStoreName(storeName: string): string {
    return storeName.replace(/\s*\(current\)$/, '')
}

/**
 * Checks if a store name matches the current shop
 */
export function isCurrentStore(storeName: string, shopName?: string): boolean {
    return storeName === shopName || storeName === `${shopName} (current)`
}

type StoreItem = {
    name: string
}

/**
 * Builds the notification message for duplicate guidance action
 */
export function buildDuplicateNotificationMessage(
    selectedStores: StoreItem[],
    shopName?: string,
): string {
    const currentStoreSelected = selectedStores.some((store) =>
        isCurrentStore(store.name, shopName),
    )
    const otherStores = selectedStores.filter(
        (store) => !isCurrentStore(store.name, shopName),
    )

    if (currentStoreSelected && otherStores.length === 0) {
        return 'Guidance duplicated'
    }

    const storeNames = otherStores
        .map((store) => cleanStoreName(store.name))
        .join(', ')

    if (currentStoreSelected) {
        return `Guidance duplicated to ${shopName} and ${storeNames}`
    }

    return `Guidance duplicated to ${storeNames}`
}
