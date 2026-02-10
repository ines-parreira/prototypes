import type { MetafieldType } from '@gorgias/helpdesk-types'

import { BASIC_OPERATORS } from 'config'

export const METAFIELD_TYPES_SUPPORTED_IN_RULES: readonly MetafieldType[] = [
    'single_line_text_field',
    'multi_line_text_field',
    'url',
    'color',
    'id',
    'link',
    'customer_reference',
    'product_reference',
    'company_reference',
    'collection_reference',
    'variant_reference',
    'number_integer',
    'number_decimal',
    'rating',
    'dimension',
    'volume',
    'weight',
    'money',
    'boolean',
    'date',
    'date_time',
] as const

const TEXT_OPERATORS = {
    eq: { label: 'is' },
    neq: { label: 'is not' },
    contains: { label: 'contains' },
    notContains: { label: 'does not contain' },
    startsWith: { label: 'starts with' },
    endsWith: { label: 'ends with' },
    containsAll: { label: 'contains all of' },
    containsAny: { label: 'contains one of' },
    notContainsAll: { label: 'does not contain all of' },
    notContainsAny: { label: 'does not contain any of' },
}

const NUMERIC_OPERATORS = {
    eq: { label: 'is' },
    neq: { label: 'is not' },
    lt: { label: 'less than' },
    lte: { label: 'less than or equal' },
    gt: { label: 'greater than' },
    gte: { label: 'greater than or equal' },
}

const BOOLEAN_OPERATORS = {
    eq: { label: 'is' },
    neq: { label: 'is not' },
}

const DATE_OPERATORS = {
    gte: { label: 'after' },
    lte: { label: 'before' },
    gteTimedelta: { label: 'less than' },
    lteTimedelta: { label: 'more than' },
}

export default function getMetafieldOperators(metafieldType?: MetafieldType) {
    switch (metafieldType) {
        case 'single_line_text_field':
        case 'multi_line_text_field':
        case 'url':
        case 'color':
        case 'id':
        case 'link':
        case 'customer_reference':
        case 'product_reference':
        case 'company_reference':
        case 'collection_reference':
        case 'variant_reference':
            return TEXT_OPERATORS
        case 'number_integer':
        case 'number_decimal':
        case 'rating':
        case 'dimension':
        case 'volume':
        case 'weight':
        case 'money':
            return NUMERIC_OPERATORS
        case 'boolean':
            return BOOLEAN_OPERATORS
        case 'date':
        case 'date_time':
            return DATE_OPERATORS
        default:
            return BASIC_OPERATORS
    }
}
