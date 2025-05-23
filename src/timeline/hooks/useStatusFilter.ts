import { useCallback, useState } from 'react'

import { TicketCompact } from '@gorgias/helpdesk-queries'

import { logEvent, SegmentEvent } from 'common/segment'

import { STATUS_FILTERS } from '../constants'
import { filterTicketsByStatus } from '../helpers/statusFilter'
import { FilterKey } from '../types'

export function useStatusFilter(tickets: TicketCompact[]) {
    const [selectedStatus, setSelectedStatus] = useState(
        STATUS_FILTERS.map((status) => status.value),
    )

    const toggleSelectedStatus = useCallback((newStatus: FilterKey) => {
        setSelectedStatus((previousSelectedStatus) => {
            if (previousSelectedStatus.includes(newStatus)) {
                logEvent(SegmentEvent.CustomerTimelineFilter, {
                    account_id: window.GORGIAS_STATE.currentAccount.id,
                    action: 'status-removed',
                    option: newStatus,
                })
                return previousSelectedStatus.filter(
                    (status) => status !== newStatus,
                )
            }
            logEvent(SegmentEvent.CustomerTimelineFilter, {
                account_id: window.GORGIAS_STATE.currentAccount.id,
                action: 'status-added',
                option: newStatus,
            })
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
