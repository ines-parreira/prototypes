import { TicketInfobarTab } from '../constants'
import type { NavigationState } from '../types'

export function toggleEditShopifyFields(
    state: NavigationState,
    open: boolean,
): NavigationState {
    return {
        ...state,
        ticketInfobar: {
            ...state.ticketInfobar,
            isEditShopifyFieldsOpen: open,
            ...(open && { activeTab: TicketInfobarTab.Shopify }),
        },
    }
}
