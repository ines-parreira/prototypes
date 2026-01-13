import cn from 'classnames'

import { Icon, type IconName, Text } from '@gorgias/axiom'
import type { MetafieldType } from '@gorgias/helpdesk-types'

import css from './MetafieldTypeItem.less'

export interface MetafieldTypeItemProps {
    type: MetafieldType
    disabled?: boolean
}

export const typeConfig: Partial<
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

export default function MetafieldTypeItem({
    type,
    disabled = false,
}: MetafieldTypeItemProps) {
    const { icon = '', label = '' } = Object(typeConfig[type])
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
