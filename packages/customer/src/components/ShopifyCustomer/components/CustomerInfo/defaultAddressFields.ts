import type { FieldConfig } from './types'

export const DEFAULT_ADDRESS_FIELD_DEFINITIONS: Record<string, FieldConfig> = {
    address1: {
        id: 'address1',
        type: 'readonly',
        label: 'Address 1',
        getValue: (ctx) => ctx.shopper?.data?.default_address?.address1,
    },
    address2: {
        id: 'address2',
        type: 'readonly',
        label: 'Address 2',
        getValue: (ctx) =>
            ctx.shopper?.data?.default_address?.address2 ?? undefined,
    },
    city: {
        id: 'city',
        type: 'readonly',
        label: 'City',
        getValue: (ctx) => ctx.shopper?.data?.default_address?.city,
    },
    company: {
        id: 'company',
        type: 'readonly',
        label: 'Company',
        getValue: (ctx) =>
            ctx.shopper?.data?.default_address?.company ?? undefined,
    },
    country: {
        id: 'country',
        type: 'readonly',
        label: 'Country',
        getValue: (ctx) => ctx.shopper?.data?.default_address?.country,
    },
    countryCode: {
        id: 'countryCode',
        type: 'readonly',
        label: 'Country code',
        getValue: (ctx) => ctx.shopper?.data?.default_address?.country_code,
    },
    countryName: {
        id: 'countryName',
        type: 'readonly',
        label: 'Country name',
        getValue: (ctx) => ctx.shopper?.data?.default_address?.country_name,
    },
    customerId: {
        id: 'customerId',
        type: 'readonly',
        label: 'Customer ID',
        getValue: (ctx) => ctx.shopper?.data?.default_address?.customer_id,
    },
    default: {
        id: 'default',
        type: 'readonly',
        label: 'Default',
        getValue: (ctx) =>
            ctx.shopper?.data?.default_address?.default != null
                ? String(ctx.shopper.data.default_address.default)
                : undefined,
    },
    firstName: {
        id: 'firstName',
        type: 'readonly',
        label: 'First name',
        getValue: (ctx) => ctx.shopper?.data?.default_address?.first_name,
    },
    lastName: {
        id: 'lastName',
        type: 'readonly',
        label: 'Last name',
        getValue: (ctx) => ctx.shopper?.data?.default_address?.last_name,
    },
    zip: {
        id: 'zip',
        type: 'readonly',
        label: 'Zip',
        getValue: (ctx) => ctx.shopper?.data?.default_address?.zip,
    },
    phone: {
        id: 'phone',
        type: 'readonly',
        label: 'Phone',
        getValue: (ctx) =>
            ctx.shopper?.data?.default_address?.phone ?? undefined,
    },
    province: {
        id: 'province',
        type: 'readonly',
        label: 'Province',
        getValue: (ctx) => ctx.shopper?.data?.default_address?.province,
    },
    provinceCode: {
        id: 'provinceCode',
        type: 'readonly',
        label: 'Province code',
        getValue: (ctx) =>
            ctx.shopper?.data?.default_address?.province_code ?? undefined,
    },
    name: {
        id: 'name',
        type: 'readonly',
        label: 'Name',
        getValue: (ctx) => ctx.shopper?.data?.default_address?.name,
    },
    id: {
        id: 'id',
        type: 'readonly',
        label: 'ID',
        getValue: (ctx) => ctx.shopper?.data?.default_address?.id,
    },
}
