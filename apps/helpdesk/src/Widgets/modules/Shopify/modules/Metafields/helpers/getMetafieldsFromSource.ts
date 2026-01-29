import type { Map } from 'immutable'

import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

function normalizeMetafieldValue(value: unknown): unknown {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value)
        } catch {
            return value
        }
    }
    return value
}

export function getMetafieldsFromSource(
    source: Map<any, any> | undefined | null,
): ShopifyMetafield[] | undefined {
    const metafields = source?.get('metafields')?.toJS() as
        | ShopifyMetafield[]
        | undefined
    return metafields?.map((metafield) => ({
        ...metafield,
        value: normalizeMetafieldValue(metafield.value),
    })) as ShopifyMetafield[] | undefined
}
