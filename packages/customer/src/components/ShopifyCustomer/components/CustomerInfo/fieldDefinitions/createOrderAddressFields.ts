import type { OrderFieldConfig } from '../types'

type AddressKey = 'billing_address' | 'shipping_address'

export function createOrderAddressFields(
    addressKey: AddressKey,
): Record<string, OrderFieldConfig> {
    return {
        name: {
            id: 'name',
            type: 'readonly',
            label: 'Name',
            getValue: (ctx) => ctx.order[addressKey]?.name,
        },
        address1: {
            id: 'address1',
            type: 'readonly',
            label: 'Address 1',
            getValue: (ctx) => ctx.order[addressKey]?.address1 ?? undefined,
        },
        address2: {
            id: 'address2',
            type: 'readonly',
            label: 'Address 2',
            getValue: (ctx) => ctx.order[addressKey]?.address2 ?? undefined,
        },
        city: {
            id: 'city',
            type: 'readonly',
            label: 'City',
            getValue: (ctx) => ctx.order[addressKey]?.city ?? undefined,
        },
        country: {
            id: 'country',
            type: 'readonly',
            label: 'Country',
            getValue: (ctx) => ctx.order[addressKey]?.country ?? undefined,
        },
        province: {
            id: 'province',
            type: 'readonly',
            label: 'Province',
            getValue: (ctx) => ctx.order[addressKey]?.province ?? undefined,
        },
        province_code: {
            id: 'province_code',
            type: 'readonly',
            label: 'Province code',
            getValue: (ctx) =>
                ctx.order[addressKey]?.province_code ?? undefined,
        },
        zip: {
            id: 'zip',
            type: 'readonly',
            label: 'Zip',
            getValue: (ctx) => ctx.order[addressKey]?.zip ?? undefined,
        },
    }
}
