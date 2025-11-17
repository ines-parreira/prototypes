import type { Order } from 'constants/integrations/types/shopify'
import type { Customer } from 'models/customer/types'
import * as timelineItem from 'timeline/helpers/timelineItem'

export function extractOrders(customer: Customer): Order[] {
    const integrations = Object.values(customer?.integrations ?? {})
    return integrations
        .filter(timelineItem.isSupportedOrderIntegration)
        .flatMap((v) => v.orders ?? [])
}
