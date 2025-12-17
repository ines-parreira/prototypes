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

/**
 * Creates an HTML link for a store
 */
export function createStoreLink(storeName: string): string {
    const cleanName = cleanStoreName(storeName)
    const storeUrl = `/app/ai-agent/shopify/${cleanName}/knowledge`
    return `<a href="${storeUrl}">${cleanName}</a>`
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

    const storeLinks = otherStores
        .map((store) => createStoreLink(store.name))
        .join(', ')

    if (currentStoreSelected) {
        return `Guidance duplicated to ${shopName} and ${storeLinks}`
    }

    return `Guidance duplicated to ${storeLinks}`
}
