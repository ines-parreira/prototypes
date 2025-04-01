import { useCallback, useState } from 'react'

import { TicketSummary } from '@gorgias/api-queries'

import { STATUS_FILTERS } from '../constants'
import { filterTicketsByStatus } from '../helpers/statusFilter'
import { FilterKey } from '../types'

export function useStatusFilter(tickets: TicketSummary[]) {
    const [selectedStatus, setSelectedStatus] = useState(
        STATUS_FILTERS.map((status) => status.value),
    )

    const toggleSelectedStatus = useCallback((newStatus: FilterKey) => {
        setSelectedStatus((previousSelectedStatus) => {
            if (previousSelectedStatus.includes(newStatus)) {
                return previousSelectedStatus.filter(
                    (status) => status !== newStatus,
                )
            }
            return [...previousSelectedStatus, newStatus]
        })
    }, [])

    const statusFilteredTickets = filterTicketsByStatus(tickets, selectedStatus)

    return {
        selectedStatus,
        statusFilteredTickets,
        toggleSelectedStatus,
    }
}
