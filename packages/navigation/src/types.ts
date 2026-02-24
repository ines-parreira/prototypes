import type { Dispatch, SetStateAction } from 'react'

import type { TicketInfobarTab } from './constants'

export type NavigationState = {
    ticketInfobar: TicketInfobarNavigationState
}

export type NavigationContextValue = [
    NavigationState,
    Dispatch<SetStateAction<NavigationState>>,
]

export type TicketInfobarNavigationState = {
    activeTab: TicketInfobarTab
    isExpanded: boolean
    isEditShopifyFieldsOpen: boolean
}

export type TicketInfobarNavigationContextValue =
    TicketInfobarNavigationState & {
        onChangeTab: (tab: TicketInfobarTab) => void
        onToggle: () => void
        onToggleEditShopifyFields: (open: boolean) => void
    }
