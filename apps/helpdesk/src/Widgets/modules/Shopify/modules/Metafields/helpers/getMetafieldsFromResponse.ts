import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

type MetafieldsResponse = {
    data?: {
        data?: unknown
    }
}

export function getMetafieldsFromResponse(
    response: MetafieldsResponse | undefined | null,
): ShopifyMetafield[] | undefined {
    const fields = response?.data?.data as ShopifyMetafield[] | undefined
    return fields?.filter(
        (field) =>
            !['customer_reference', 'company_reference', 'id', 'link'].includes(
                field.type,
            ),
    )
}
