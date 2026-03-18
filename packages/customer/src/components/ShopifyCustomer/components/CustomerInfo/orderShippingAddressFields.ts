import type { OrderFieldConfig } from './types'

export const SHIPPING_ADDRESS_FIELD_DEFINITIONS: Record<
    string,
    OrderFieldConfig
> = {
    name: {
        id: 'name',
        type: 'readonly',
        label: 'Name',
        getValue: (ctx) => ctx.order.shipping_address?.name,
    },
    address1: {
        id: 'address1',
        type: 'readonly',
        label: 'Address 1',
        getValue: (ctx) => ctx.order.shipping_address?.address1 ?? undefined,
    },
    address2: {
        id: 'address2',
        type: 'readonly',
        label: 'Address 2',
        getValue: (ctx) => ctx.order.shipping_address?.address2 ?? undefined,
    },
    city: {
        id: 'city',
        type: 'readonly',
        label: 'City',
        getValue: (ctx) => ctx.order.shipping_address?.city ?? undefined,
    },
    country: {
        id: 'country',
        type: 'readonly',
        label: 'Country',
        getValue: (ctx) => ctx.order.shipping_address?.country ?? undefined,
    },
    province: {
        id: 'province',
        type: 'readonly',
        label: 'Province',
        getValue: (ctx) => ctx.order.shipping_address?.province ?? undefined,
    },
    province_code: {
        id: 'province_code',
        type: 'readonly',
        label: 'Province code',
        getValue: (ctx) =>
            ctx.order.shipping_address?.province_code ?? undefined,
    },
    zip: {
        id: 'zip',
        type: 'readonly',
        label: 'Zip',
        getValue: (ctx) => ctx.order.shipping_address?.zip ?? undefined,
    },
}
