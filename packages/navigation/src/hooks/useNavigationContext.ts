import { useState } from 'react'

import { TicketInfobarTab } from '../constants'
import type { NavigationContextValue, NavigationState } from '../types'

export function useNavigationContext(): NavigationContextValue {
    return useState<NavigationState>({
        ticketInfobar: {
            activeTab: TicketInfobarTab.Customer,
            isExpanded: true,
            isEditShopifyFieldsOpen: false,
        },
    })
}
