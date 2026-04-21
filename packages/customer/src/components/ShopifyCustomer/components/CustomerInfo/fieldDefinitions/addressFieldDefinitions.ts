import type { ShopperAddress } from '../../../types'
import type { FieldConfig, FieldRenderContext } from '../types'

type AddressGetter = (ctx: FieldRenderContext) => ShopperAddress | undefined

function createAddressFields(
    getAddress: AddressGetter,
): Record<string, FieldConfig> {
    return {
        address1: {
            id: 'address1',
            type: 'readonly',
            label: 'Address 1',
            copyable: true,
            getValue: (ctx) => getAddress(ctx)?.address1,
        },
        address2: {
            id: 'address2',
            type: 'readonly',
            label: 'Address 2',
            copyable: true,
            getValue: (ctx) => getAddress(ctx)?.address2 ?? undefined,
        },
        city: {
            id: 'city',
            type: 'readonly',
            label: 'City',
            copyable: true,
            getValue: (ctx) => getAddress(ctx)?.city,
        },
        company: {
            id: 'company',
            type: 'readonly',
            label: 'Company',
            copyable: true,
            getValue: (ctx) => getAddress(ctx)?.company ?? undefined,
        },
        country: {
            id: 'country',
            type: 'readonly',
            label: 'Country',
            copyable: true,
            getValue: (ctx) => getAddress(ctx)?.country,
        },
        countryCode: {
            id: 'countryCode',
            type: 'readonly',
            label: 'Country code',
            copyable: true,
            getValue: (ctx) => getAddress(ctx)?.country_code,
        },
        countryName: {
            id: 'countryName',
            type: 'readonly',
            label: 'Country name',
            copyable: true,
            getValue: (ctx) => getAddress(ctx)?.country_name,
        },
        customerId: {
            id: 'customerId',
            type: 'readonly',
            label: 'Customer ID',
            getValue: (ctx) => getAddress(ctx)?.customer_id,
        },
        default: {
            id: 'default',
            type: 'readonly',
            label: 'Default',
            getValue: (ctx) => {
                const addr = getAddress(ctx)
                return addr?.default != null ? String(addr.default) : undefined
            },
        },
        firstName: {
            id: 'firstName',
            type: 'readonly',
            label: 'First name',
            copyable: true,
            getValue: (ctx) => getAddress(ctx)?.first_name,
        },
        lastName: {
            id: 'lastName',
            type: 'readonly',
            label: 'Last name',
            copyable: true,
            getValue: (ctx) => getAddress(ctx)?.last_name,
        },
        zip: {
            id: 'zip',
            type: 'readonly',
            label: 'Zip',
            copyable: true,
            getValue: (ctx) => getAddress(ctx)?.zip,
        },
        phone: {
            id: 'phone',
            type: 'readonly',
            label: 'Phone',
            copyable: true,
            getValue: (ctx) => getAddress(ctx)?.phone ?? undefined,
        },
        province: {
            id: 'province',
            type: 'readonly',
            label: 'Province',
            copyable: true,
            getValue: (ctx) => getAddress(ctx)?.province,
        },
        provinceCode: {
            id: 'provinceCode',
            type: 'readonly',
            label: 'Province code',
            copyable: true,
            getValue: (ctx) => getAddress(ctx)?.province_code ?? undefined,
        },
        name: {
            id: 'name',
            type: 'readonly',
            label: 'Name',
            copyable: true,
            getValue: (ctx) => getAddress(ctx)?.name,
        },
        id: {
            id: 'id',
            type: 'readonly',
            label: 'ID',
            getValue: (ctx) => getAddress(ctx)?.id,
        },
    }
}

export const DEFAULT_ADDRESS_FIELD_DEFINITIONS = createAddressFields(
    (ctx) => ctx.shopper?.data?.default_address ?? undefined,
)

export function createAddressFieldDefinitions(
    index: number,
): Record<string, FieldConfig> {
    return createAddressFields((ctx) => ctx.shopper?.data?.addresses?.[index])
}

export const ADDRESSES_FIELD_DEFINITIONS = createAddressFieldDefinitions(0)
