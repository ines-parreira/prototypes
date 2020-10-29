//$TsFixMe fallback values, use ViewType enum instead
export const TICKET_LIST_VIEW_TYPE = 'ticket-list'
export const CUSTOMER_LIST_VIEW_TYPE = 'customer-list'

export const VIEW_TYPES = [TICKET_LIST_VIEW_TYPE, CUSTOMER_LIST_VIEW_TYPE]

//$TsFixMe fallback values, use MoveIndexDirection enum instead
export const PREV_VIEW_NAV_DIRECTION = 'prev'
export const NEXT_VIEW_NAV_DIRECTION = 'next'

export const VIEW_NAV_DIRECTIONS = {
    PREV_VIEW_NAV_DIRECTION,
    NEXT_VIEW_NAV_DIRECTION,
}

export const BASE_VIEW_ID = 0

export const SYSTEM_VIEW_CATEGORY = 'system'

//$TsFixMe fallback values, use ViewVisibility enum instead
export const ViewVisibility = Object.freeze({
    PUBLIC: 'public',
    SHARED: 'shared',
    PRIVATE: 'private',
})
