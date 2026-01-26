import type { Map } from 'immutable'

import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

export function getMetafieldsFromSource(
    source: Map<any, any> | undefined | null,
): ShopifyMetafield[] | undefined {
    return source?.get('metafields')?.toJS()
}
