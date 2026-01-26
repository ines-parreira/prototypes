import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

export type MetafieldProps = {
    integrationId: number
    customerId: number
    metafields?: ShopifyMetafield[]
    useSourceMetafields?: boolean
}
