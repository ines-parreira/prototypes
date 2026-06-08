import type {
    OrderData,
    OrderEcommerceData,
    ShopperData,
} from '../../../../types'
import type { OrdersV2Order } from '../types'

const shopper: ShopperData = {
    id: 456,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    first_name: 'John',
    last_name: 'Doe',
    state: 'enabled',
    note: '',
    verified_email: true,
    multipass_identifier: null,
    tax_exempt: false,
    email: 'john@example.com',
    phone: null,
    currency: 'USD',
    addresses: [],
    tax_exemptions: [],
    admin_graphql_api_id: 'gid://shopify/Customer/456',
    default_address: null,
    tags: '',
    metafields: [],
}

let seq = 0

export function makeOrder(
    overrides: Partial<OrderData> = {},
    ecoOverrides: Partial<OrderEcommerceData> = {},
): OrderEcommerceData {
    seq += 1
    const id = overrides.id ?? 10000 + seq

    return {
        id: `eco-${id}`,
        account_id: 1,
        created_datetime: '2024-01-15T10:00:00Z',
        updated_datetime: '2024-01-15T10:00:00Z',
        source_type: 'shopify',
        integration_id: 1,
        external_id: `ext-${id}`,
        ...ecoOverrides,
        data: {
            id,
            order_number: id,
            name: `#${id}`,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z',
            currency: 'USD',
            total_price: '99.99',
            financial_status: 'paid',
            fulfillment_status: 'fulfilled',
            line_items: [],
            customer: shopper,
            ...overrides,
        },
    }
}

export function toV2Order(
    eco: OrderEcommerceData,
    isDraft = false,
): OrdersV2Order {
    return { eco, data: eco.data, isDraft }
}
