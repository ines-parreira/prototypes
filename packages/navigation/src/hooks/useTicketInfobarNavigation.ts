import { useCallback, useMemo } from 'react'

import type { EditFieldsType, TicketInfobarTab } from '../constants'
import type { TicketInfobarNavigationContextValue } from '../types'
import { useNavigation } from './useNavigation'

export function useTicketInfobarNavigation(): TicketInfobarNavigationContextValue {
    const [state, setState] = useNavigation()

    const onChangeTab = useCallback(
        (
            activeTab: TicketInfobarTab,
            options?: { shopifyIntegrationId?: number },
        ) => {
            setState((s) => ({
                ...s,
                ticketInfobar: {
                    ...s.ticketInfobar,
                    activeTab,
                    editingWidgetType: null,
                    ...(options?.shopifyIntegrationId != null && {
                        shopifyIntegrationId: options.shopifyIntegrationId,
                    }),
                },
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

    const onSetEditingWidgetType = useCallback(
        (type: EditFieldsType | null) => {
            setState((s) => ({
                ...s,
                ticketInfobar: {
                    ...s.ticketInfobar,
                    editingWidgetType: type,
                },
            }))
        },
        [setState],
    )

    return useMemo(
        () => ({
            ...state.ticketInfobar,
            onChangeTab,
            onToggle,
            onSetEditingWidgetType,
        }),
        [state.ticketInfobar, onChangeTab, onToggle, onSetEditingWidgetType],
    )
}
