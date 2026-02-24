import { useCallback, useMemo } from 'react'

import type { TicketInfobarTab } from '../constants'
import type { TicketInfobarNavigationContextValue } from '../types'
import { toggleEditShopifyFields } from './ticketInfobarNavigation.utils'
import { useNavigation } from './useNavigation'

export function useTicketInfobarNavigation(): TicketInfobarNavigationContextValue {
    const [state, setState] = useNavigation()

    const onChangeTab = useCallback(
        (activeTab: TicketInfobarTab) => {
            setState((s) => ({
                ...s,
                ticketInfobar: { ...s.ticketInfobar, activeTab },
            }))
        },
        [setState],
    )

    const onToggle = useCallback(() => {
        setState((s) => ({
            ...s,
            ticketInfobar: {
                ...s.ticketInfobar,
                isExpanded: !s.ticketInfobar.isExpanded,
            },
        }))
    }, [setState])

    const onToggleEditShopifyFields = useCallback(
        (open: boolean) => {
            setState((s) => toggleEditShopifyFields(s, open))
        },
        [setState],
    )

    return useMemo(
        () => ({
            ...state.ticketInfobar,
            onChangeTab,
            onToggle,
            onToggleEditShopifyFields,
        }),
        [state.ticketInfobar, onChangeTab, onToggle, onToggleEditShopifyFields],
    )
}
