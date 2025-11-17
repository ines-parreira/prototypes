import type { MetafieldType } from '../MetafieldTypeItem/MetafieldTypeItem'

const supportedTypes: MetafieldType[] = [
    'single_line_text',
    'multi_line_text',
    'date_time',
    'date',
    'dimension',
    'volume',
    'weight',
    'decimal',
    'integer',
    'company',
    'customer',
    'product',
    'collection',
    'product_variant',
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
