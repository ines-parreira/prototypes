import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

type MetafieldsResponse = {
    data?: {
        data?: unknown
    }
}

export function getMetafieldsFromResponse(
    response: MetafieldsResponse | undefined | null,
): ShopifyMetafield[] | undefined {
    return response?.data?.data as ShopifyMetafield[] | undefined
}
