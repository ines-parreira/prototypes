import type { MetafieldType } from '@gorgias/helpdesk-types'

const supportedTypes: MetafieldType[] = [
    'single_line_text_field',
    'multi_line_text_field',
    'date_time',
    'date',
    'dimension',
    'volume',
    'weight',
    'number_decimal',
    'number_integer',
    'company_reference',
    'customer_reference',
    'product_reference',
    'collection_reference',
    'variant_reference', // productVariant
    'boolean',
    'color',
    'id',
    'rating',
    'url',
    'money',
    'link',
]

export const isSupportedMetafieldType = (type?: MetafieldType): boolean => {
    return !!(type && supportedTypes.includes(type))
}
