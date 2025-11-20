import { useCallback, useMemo } from 'react'

import { useSearchParams } from '@repo/routing'

import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { TicketSearchParamsKeys } from '../../../utils/routing/TicketSearchParamsKeys'

const { key, parse } = TicketSearchParamsKeys.showTicketQuickReplies

export function useTicketQuickRepliesDisplay() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { toggleQuickReplies } = useTicketsLegacyBridge()
    const areQuickRepliesVisible = useMemo(
        () => parse(searchParams.get(key)),
        [searchParams],
    )

    const handleShowAllQuickRepliesDisplay = useCallback(() => {
        if (!areQuickRepliesVisible) {
            setSearchParams(({ draft }) => ({
                ...draft,
                [key]: 'true',
            }))
            toggleQuickReplies(true)
        } else {
            setSearchParams(({ prev }) => {
                prev.delete(key)
                return prev
            })
            toggleQuickReplies(false)
        }
    }, [setSearchParams, toggleQuickReplies, areQuickRepliesVisible])

    return {
        handleShowAllQuickRepliesDisplay,
        areQuickRepliesVisible,
    }
}
