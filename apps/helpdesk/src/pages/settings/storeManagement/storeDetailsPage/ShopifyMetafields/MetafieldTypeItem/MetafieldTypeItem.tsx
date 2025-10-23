import cn from 'classnames'

import { Icon, type IconName, Text } from '@gorgias/axiom'

import css from './MetafieldTypeItem.less'

export type MetafieldType =
    | 'single_line_text'
    | 'multi_line_text'
    | 'date_time'
    | 'date'
    | 'dimension'
    | 'volume'
    | 'weight'
    | 'decimal'
    | 'integer'
    | 'company'
    | 'customer'
    | 'product'
    | 'collection'
    | 'product_variant'
    | 'boolean'
    | 'color'
    | 'id'
    | 'rating'
    | 'url'
    | 'money'
    | 'link'
    | 'json'
    | 'file'
    | 'rich_text'
    | 'page'
    | 'meta_object'
    | 'mixed_reference'

export interface MetafieldTypeItemProps {
    type: MetafieldType
    disabled?: boolean
}

const typeConfig: Record<MetafieldType, { icon: IconName; label: string }> = {
    single_line_text: { icon: 'font', label: 'Single-line text' },
    multi_line_text: { icon: 'text-align-left', label: 'Multi-line text' },
    date_time: { icon: 'calendar-event', label: 'Date and time' },
    date: { icon: 'calendar', label: 'Date' },
    dimension: { icon: 'ruler', label: 'Dimension' },
    volume: { icon: 'chart-bar-vertical', label: 'Volume' },
    weight: { icon: 'scale', label: 'Weight' },
    decimal: { icon: 'percent', label: 'Decimal' },
    integer: { icon: 'hashtag', label: 'Integer' },
    company: { icon: 'nav-building-alt-4', label: 'Company' },
    customer: { icon: 'user', label: 'Customer' },
    product: { icon: 'shopping-bag', label: 'Product' },
    collection: { icon: 'shopping-cart', label: 'Collection' },
    product_variant: { icon: 'tag', label: 'Product variant' },
    boolean: { icon: 'swicht-left', label: 'True or false' },
    color: { icon: 'palette', label: 'Color' },
    id: { icon: 'user-card-id', label: 'ID' },
    rating: { icon: 'star', label: 'Rating' },
    url: { icon: 'nav-globe', label: 'URL' },
    money: { icon: 'credit-card', label: 'Money' },
    link: { icon: 'link-horizontal', label: 'Link' },
    json: { icon: 'data-object', label: 'JSON' },
    file: { icon: 'data-object', label: 'File' },
    rich_text: { icon: 'data-object', label: 'Rich text' },
    page: { icon: 'data-object', label: 'Page' },
    meta_object: { icon: 'data-object', label: 'Metaobject' },
    mixed_reference: { icon: 'data-object', label: 'Mixed reference' },
}

export default function MetafieldTypeItem({
    type,
    disabled = false,
}: MetafieldTypeItemProps) {
    const { icon, label } = Object(typeConfig[type])
    return (
        <div className={cn(css.container, { [css.disabled]: disabled })}>
            <Icon
                size="md"
                aria-disabled={disabled ? true : undefined}
                name={icon}
            />
            <Text>{label}</Text>
        </div>
    )
}
