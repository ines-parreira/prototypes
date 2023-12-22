import {QueryKey, useQueryClient} from '@tanstack/react-query'
import {useEffect, useMemo, useState} from 'react'

import {fetchTicketsByTicketIds} from 'models/ticket/resources'

import {TicketSummary} from '../types'

export default function useTicketData(
    visibleStaleTicketIds: number[],
    markUpdated: (ticketIds: number[]) => void
) {
    const queryClient = useQueryClient()
    const [data, setData] = useState<Record<number, TicketSummary>>({})

    const queryKey = useMemo(
        (): QueryKey | undefined =>
            visibleStaleTicketIds?.length > 0
                ? ['tickets', 'ticket_ids', visibleStaleTicketIds]
                : undefined,
        [visibleStaleTicketIds]
    )

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
                    res.data.data.reduce(
                        (acc, d) => ({...acc, [d.id]: d}),
                        currentData
                    )
                )

                markUpdated(visibleStaleTicketIds)
            } catch (_err: unknown) {
                return
            }
        })()
    }, [markUpdated, queryClient, queryKey, visibleStaleTicketIds])

    return data
}
