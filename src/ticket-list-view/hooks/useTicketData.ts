import {useEffect, useState} from 'react'

import {TicketSummary} from '../types'

export default function useTicketData(
    visibleStaleTicketIds: number[],
    markUpdated: (ticketIds: number[]) => void
) {
    const [data] = useState<Record<number, TicketSummary>>({})

    useEffect(() => {
        const timeout = setTimeout(() => {
            markUpdated(visibleStaleTicketIds)
        }, 1000)

        return () => {
            clearTimeout(timeout)
        }
    }, [markUpdated, visibleStaleTicketIds])

    return data
}
