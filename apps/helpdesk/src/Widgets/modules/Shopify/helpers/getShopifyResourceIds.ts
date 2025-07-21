import { logEvent, SegmentEvent } from 'common/segment'
import { isSourceRecord, Source } from 'models/widget/types'

import { defaultShopifyContextValue } from '../contexts/ShopifyContext'

/**
 * Provide resource IDs, before setting proper context to children components.
 * It returns customer_id exclusively because we need it for tracking.
 * target_id is either a customer_id or an order_id depending of the Shopify
 * card targeted (an Order or a Customer). Target_id might be equal to
 * customer_id in Shopify customer card
 */

export function getShopifyResourceIds(source: Source) {
    if (!isSourceRecord(source)) {
        logEvent(SegmentEvent.ShopifyContextDataMissing, {
            domain: window.GORGIAS_STATE.currentAccount.domain,
            url: window.location.href,
        })
        return defaultShopifyContextValue.widget_resource_ids
    }

    const targetId = typeof source.id === 'number' ? source.id : null
    const customerId =
        (isSourceRecord(source.customer) && (source.customer.id as number)) ||
        null

    if (!(targetId || customerId)) {
        logEvent(SegmentEvent.ShopifyContextResourceIdMissing, {
            domain: window.GORGIAS_STATE.currentAccount.domain,
            url: window.location.href,
        })
    }

    return {
        target_id: targetId,
        customer_id: customerId,
    }
}
