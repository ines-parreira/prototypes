import { useCallback, useMemo } from 'react'

import type { TicketInfobarTab } from '../constants'
import type { TicketInfobarNavigationContextValue } from '../types'
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

    return useMemo(
        () => ({ ...state.ticketInfobar, onChangeTab, onToggle }),
        [state.ticketInfobar, onChangeTab, onToggle],
    )
}
