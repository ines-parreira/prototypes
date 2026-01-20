import type { IconName } from '@gorgias/axiom'
import { MetafieldType } from '@gorgias/helpdesk-types'

import type { SupportedCategories } from './types'

export type CategoryDefinition = {
    label: string
    value: SupportedCategories
}

export const METAFIELD_CATEGORIES: CategoryDefinition[] = [
    {
        label: 'Customer',
        value: 'Customer',
    },
    {
        label: 'Order',
        value: 'Order',
    },
    {
        label: 'Draft Order',
        value: 'DraftOrder',
    },
]

export const MAX_FIELDS_PER_CATEGORY = 10

export const DEFAULT_TABLE_PAGE_SIZE = 10

export const TYPE_CONFIG: Partial<
    Record<MetafieldType, { icon: IconName; label: string }>
> = {
    single_line_text_field: { icon: 'font', label: 'Single-line text' },
    multi_line_text_field: {
        icon: 'text-align-left',
        label: 'Multi-line text',
    },
    date_time: { icon: 'calendar-event', label: 'Date and time' },
    date: { icon: 'calendar', label: 'Date' },
    dimension: { icon: 'ruler', label: 'Dimension' },
    volume: { icon: 'chart-bar-vertical', label: 'Volume' },
    weight: { icon: 'scale', label: 'Weight' },
    number_decimal: { icon: 'percent', label: 'Decimal' },
    number_integer: { icon: 'hashtag', label: 'Integer' },
    company_reference: { icon: 'nav-building-alt-4', label: 'Company' },
    customer_reference: { icon: 'user', label: 'Customer' },
    product_reference: { icon: 'shopping-bag', label: 'Product' },
    collection_reference: { icon: 'shopping-cart', label: 'Collection' },
    variant_reference: { icon: 'tag', label: 'Product variant' },
    boolean: { icon: 'swicht-left', label: 'True or false' },
    color: { icon: 'palette', label: 'Color' },
    id: { icon: 'user-card-id', label: 'ID' },
    rating: { icon: 'star', label: 'Rating' },
    url: { icon: 'nav-globe', label: 'URL' },
    money: { icon: 'credit-card', label: 'Money' },
    link: { icon: 'link-horizontal', label: 'Link' },
    json: { icon: 'data-object', label: 'JSON' },
    file_reference: { icon: 'data-object', label: 'File' },
    rich_text_field: { icon: 'data-object', label: 'Rich text' },
    page_reference: { icon: 'data-object', label: 'Page' },
    metaobject_reference: { icon: 'data-object', label: 'Metaobject' },
    mixed_reference: { icon: 'data-object', label: 'Mixed reference' },
}

export const SUPPORTED_METAFIELD_TYPES: MetafieldType[] = [
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
    'variant_reference',
    'boolean',
    'color',
    'id',
    'rating',
    'url',
    'money',
    'link',
]

export const METAFIELD_TYPE_OPTIONS = Object.values(MetafieldType).map(
    (type) => ({
        id: type,
        type,
        label: TYPE_CONFIG[type]?.label || type,
    }),
)
