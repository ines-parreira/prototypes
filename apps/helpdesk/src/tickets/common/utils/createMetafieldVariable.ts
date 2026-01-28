import type { Variable } from 'tickets/common/config'

export default function createMetafieldVariable(
    value: string,
): Variable | undefined {
    const match = value?.match(/\.metafields\.([a-zA-Z0-9_]+)\.value}}$/)
    if (!match) return undefined
    let category = 'Metafield'
    if (value.includes('.customer.metafields.')) category = 'Customer metafield'
    else if (value.includes('.orders[0].metafields.'))
        category = 'Order metafield'
    else if (value.includes('.draft_orders[0].metafields.'))
        category = 'Draft Order metafield'

    return {
        type: 'shopify',
        name: match[1],
        fullName: `${category}: ${match[1]}`,
        value,
        integration: 'shopify',
    }
}
