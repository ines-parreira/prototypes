import type { CustomerHighlightDataItem } from '@gorgias/helpdesk-types'

export function customerHighlightsTransform(item: CustomerHighlightDataItem) {
    const highlights = item?.highlights

    const { entity: customer } = item

    if (!customer) {
        return null
    }

    return {
        id: customer.id as number,
        email: highlights?.email?.[0] ?? customer.email ?? null,
        name: highlights?.name?.[0] ?? customer.name ?? null,
        channels: customer?.channels,
        orderId: highlights?.order_ids?.[0]
            ? `Order ID: ${highlights?.order_ids[0]}`
            : undefined,
    }
}
