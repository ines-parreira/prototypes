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
