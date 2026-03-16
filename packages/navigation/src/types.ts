import type { Dispatch, SetStateAction } from 'react'

import type { EditFieldsType, TicketInfobarTab } from './constants'

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
    editingWidgetType: EditFieldsType | null
    shopifyIntegrationId?: number
}

export type TicketInfobarNavigationContextValue =
    TicketInfobarNavigationState & {
        onChangeTab: (
            tab: TicketInfobarTab,
            options?: { shopifyIntegrationId?: number },
        ) => void
        onToggle: () => void
        onSetEditingWidgetType: (type: EditFieldsType | null) => void
    }
