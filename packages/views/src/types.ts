import type { ListViewSections200DataItem } from '@gorgias/helpdesk-types'

export type ViewSection = ListViewSections200DataItem

export type DisplayOrderMap = Record<string, { display_order: number }>

export type PrivateViewsOrderingData = {
    views: DisplayOrderMap
    view_sections: DisplayOrderMap
}

export type PublicViewsOrderingData = PrivateViewsOrderingData & {
    views_top: DisplayOrderMap
    views_bottom: DisplayOrderMap
}

export function isViewsOrderingData(
    value: unknown,
): value is PrivateViewsOrderingData {
    return typeof value === 'object' && value !== null && 'views' in value
}

export type ViewsVisibilityData = {
    hidden_views: number[]
}

export function isViewsVisibilityData(
    value: unknown,
): value is ViewsVisibilityData {
    return (
        typeof value === 'object' &&
        value !== null &&
        'hidden_views' in value &&
        Array.isArray(value.hidden_views) &&
        value.hidden_views.every((id) => typeof id === 'number')
    )
}
