import type { FieldConfig } from './types'

export function createAddressFieldDefinitions(
    index: number,
): Record<string, FieldConfig> {
    return {
        address1: {
            id: 'address1',
            type: 'readonly',
            label: 'Address 1',
            getValue: (ctx) => ctx.shopper?.data?.addresses?.[index]?.address1,
        },
        address2: {
            id: 'address2',
            type: 'readonly',
            label: 'Address 2',
            getValue: (ctx) =>
                ctx.shopper?.data?.addresses?.[index]?.address2 ?? undefined,
        },
        city: {
            id: 'city',
            type: 'readonly',
            label: 'City',
            getValue: (ctx) => ctx.shopper?.data?.addresses?.[index]?.city,
        },
        company: {
            id: 'company',
            type: 'readonly',
            label: 'Company',
            getValue: (ctx) =>
                ctx.shopper?.data?.addresses?.[index]?.company ?? undefined,
        },
        country: {
            id: 'country',
            type: 'readonly',
            label: 'Country',
            getValue: (ctx) => ctx.shopper?.data?.addresses?.[index]?.country,
        },
        countryCode: {
            id: 'countryCode',
            type: 'readonly',
            label: 'Country code',
            getValue: (ctx) =>
                ctx.shopper?.data?.addresses?.[index]?.country_code,
        },
        countryName: {
            id: 'countryName',
            type: 'readonly',
            label: 'Country name',
            getValue: (ctx) =>
                ctx.shopper?.data?.addresses?.[index]?.country_name,
        },
        customerId: {
            id: 'customerId',
            type: 'readonly',
            label: 'Customer ID',
            getValue: (ctx) =>
                ctx.shopper?.data?.addresses?.[index]?.customer_id,
        },
        default: {
            id: 'default',
            type: 'readonly',
            label: 'Default',
            getValue: (ctx) =>
                ctx.shopper?.data?.addresses?.[index]?.default != null
                    ? String(ctx.shopper.data.addresses[index].default)
                    : undefined,
        },
        firstName: {
            id: 'firstName',
            type: 'readonly',
            label: 'First name',
            getValue: (ctx) =>
                ctx.shopper?.data?.addresses?.[index]?.first_name,
        },
        lastName: {
            id: 'lastName',
            type: 'readonly',
            label: 'Last name',
            getValue: (ctx) => ctx.shopper?.data?.addresses?.[index]?.last_name,
        },
        zip: {
            id: 'zip',
            type: 'readonly',
            label: 'Zip',
            getValue: (ctx) => ctx.shopper?.data?.addresses?.[index]?.zip,
        },
        phone: {
            id: 'phone',
            type: 'readonly',
            label: 'Phone',
            getValue: (ctx) =>
                ctx.shopper?.data?.addresses?.[index]?.phone ?? undefined,
        },
        province: {
            id: 'province',
            type: 'readonly',
            label: 'Province',
            getValue: (ctx) => ctx.shopper?.data?.addresses?.[index]?.province,
        },
        provinceCode: {
            id: 'provinceCode',
            type: 'readonly',
            label: 'Province code',
            getValue: (ctx) =>
                ctx.shopper?.data?.addresses?.[index]?.province_code ??
                undefined,
        },
        name: {
            id: 'name',
            type: 'readonly',
            label: 'Name',
            getValue: (ctx) => ctx.shopper?.data?.addresses?.[index]?.name,
        },
        id: {
            id: 'id',
            type: 'readonly',
            label: 'ID',
            getValue: (ctx) => ctx.shopper?.data?.addresses?.[index]?.id,
        },
    }
}

export const ADDRESSES_FIELD_DEFINITIONS = createAddressFieldDefinitions(0)
