import { useCallback, useEffect, useMemo, useState } from 'react'

import { QueryKey, useQueryClient } from '@tanstack/react-query'

import { fetchTicketsByTicketIds } from 'models/ticket/resources'

import { TicketCompact } from '../types'

export default function useTicketData(
    visibleStaleTicketIds: number[],
    markUpdated: (ticketIds: number[]) => void,
    ticketId?: number,
) {
    const queryClient = useQueryClient()
    const [data, setData] = useState<Record<number, TicketCompact>>({})

    const queryKey = useMemo(
        (): QueryKey | undefined =>
            visibleStaleTicketIds?.length > 0
                ? ['tickets', 'ticket_ids', visibleStaleTicketIds]
                : undefined,
        [visibleStaleTicketIds],
    )

    const bulkToggleUnread = useCallback(
        (ticketIds: number[], isUnread: boolean) => {
            setData((currentData) => {
                const newData = { ...currentData }
                let isDirty = false

                ticketIds.forEach((ticketId) => {
                    const ticket = currentData[ticketId]
                    if (!ticket) return

                    newData[ticketId] = { ...ticket, is_unread: isUnread }
                    isDirty = true
                })

                return isDirty ? newData : currentData
            })
        },
        [],
    )

    const toggleUnread = useCallback((ticketId: number, isUnread: boolean) => {
        setData((currentData) => {
            const ticket = currentData[ticketId]
            if (!ticket) return currentData

            return {
                ...currentData,
                [ticketId]: {
                    ...ticket,
                    is_unread: isUnread,
                },
            }
        })
    }, [])

    useEffect(() => {
        if (!ticketId) return
        toggleUnread(ticketId, false)
    }, [ticketId, toggleUnread])

    useEffect(() => {
        void (async () => {
            if (!visibleStaleTicketIds.length) return

            try {
                const res = await queryClient.fetchQuery({
                    queryFn: () =>
                        fetchTicketsByTicketIds(visibleStaleTicketIds),
                    queryKey,
                })

                setData((currentData) =>
                    res.reduce(
                        (acc, d) => ({ ...acc, [d.id]: d }),
                        currentData,
                    ),
                )

                markUpdated(visibleStaleTicketIds)
            } catch {
                return
            }
        })()
    }, [markUpdated, queryClient, queryKey, visibleStaleTicketIds])

    return useMemo(
        () => ({ bulkToggleUnread, data, toggleUnread }),
        [bulkToggleUnread, data, toggleUnread],
    )
}
