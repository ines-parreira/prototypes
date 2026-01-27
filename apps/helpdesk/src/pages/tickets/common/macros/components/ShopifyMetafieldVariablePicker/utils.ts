import type { CategoryOption, MetafieldCategory } from './types'

export const CATEGORIES: CategoryOption[] = [
    { id: 'Customer', name: 'Customer' },
    { id: 'Order', name: 'Last Order' },
    { id: 'DraftOrder', name: 'Last Draft Order' },
]

export function getMetafieldVariableValue(
    integrationId: number,
    category: MetafieldCategory,
    metafieldKey: string,
): string {
    const basePaths: Record<MetafieldCategory, string> = {
        Customer: `ticket.customer.integrations[${integrationId}].customer.metafields`,
        Order: `ticket.customer.integrations[${integrationId}].orders[0].metafields`,
        DraftOrder: `ticket.customer.integrations[${integrationId}].draft_orders[0].metafields`,
    }

    return `{{${basePaths[category]}.${metafieldKey}.value}}`
}
