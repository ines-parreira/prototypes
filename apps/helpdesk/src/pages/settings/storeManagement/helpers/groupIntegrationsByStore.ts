import type { StoreMapping } from 'models/storeMapping/types'

type StoreChannelRecord = {
    store_id: number
    integrations: number[]
}

export default function groupIntegrationsByStore(
    data: StoreMapping[],
): StoreChannelRecord[] {
    const storeMap = new Map<number, number[]>()

    for (const { store_id, integration_id } of data) {
        const integrations = storeMap.get(store_id) || []
        storeMap.set(store_id, [...integrations, integration_id])
    }

    return Array.from(storeMap, ([store_id, integrations]) => ({
        store_id,
        integrations,
    }))
}
