import { useCallback, useMemo } from 'react'

import { useSearchParams } from '@repo/routing'

import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { TicketSearchParamsKeys } from '../../../utils/routing/TicketSearchParamsKeys'

const { key, parse } = TicketSearchParamsKeys.showTicketEvents

export function useTicketEventsDisplay() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { dispatchAuditLogEvents, dispatchHideAuditLogEvents } =
        useTicketsLegacyBridge()

    const areEventsVisible = useMemo(
        () => parse(searchParams.get(key)),
        [searchParams],
    )

    const handleShowAllEventDisplay = useCallback(() => {
        if (!areEventsVisible) {
            setSearchParams(({ draft }) => ({
                ...draft,
                [key]: 'true',
            }))
            dispatchAuditLogEvents()
        } else {
            setSearchParams(({ prev }) => {
                prev.delete(key)
                return prev
            })
            dispatchHideAuditLogEvents()
        }
    }, [
        setSearchParams,
        dispatchAuditLogEvents,
        dispatchHideAuditLogEvents,
        areEventsVisible,
    ])

    return {
        handleShowAllEventDisplay,
        areEventsVisible,
    }
}
