import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { isNumber } from 'lodash'

import { ExpandedMessagesContext } from './context'

type ExpandedMessagesProviderProps = {
    children?: ReactNode
}

export function ExpandedMessagesProvider({
    children,
}: ExpandedMessagesProviderProps) {
    const [expandedMessageIds, setExpandedMessageIds] = useState<number[]>([])

    const toggleMessage = useCallback(
        (messageId: number | null | undefined) => {
            setExpandedMessageIds((state) =>
                isNumber(messageId)
                    ? state.includes(messageId)
                        ? state.filter((id) => id !== messageId)
                        : [...state, messageId]
                    : state,
            )
        },
        [],
    )

    const isMessageExpanded = useCallback(
        (messageId: number | null | undefined) =>
            isNumber(messageId) && expandedMessageIds.includes(messageId),
        [expandedMessageIds],
    )

    const value = useMemo(
        () => ({
            expandedMessageIds,
            toggleMessage,
            isMessageExpanded,
        }),
        [expandedMessageIds, isMessageExpanded, toggleMessage],
    )

    return (
        <ExpandedMessagesContext.Provider value={value}>
            {children}
        </ExpandedMessagesContext.Provider>
    )
}
