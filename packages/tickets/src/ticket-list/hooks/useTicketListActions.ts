import { useCallback, useMemo } from 'react'

import type { TicketPriority } from '@gorgias/helpdesk-queries'
import { JobType } from '@gorgias/helpdesk-types'

import { TicketStatus } from '../../types/ticket'
import { useBulkJobAction } from './useBulkJobAction'

type Params = {
    viewId: number
    selectedTicketIds: Set<number>
    hasSelectedAll: boolean
    onActionComplete: () => void
}

export function useTicketListActions({
    viewId,
    selectedTicketIds,
    hasSelectedAll,
    onActionComplete,
}: Params) {
    const ticketIds = useMemo(
        () => Array.from(selectedTicketIds),
        [selectedTicketIds],
    )

    const { createJob, createJobRemovingTickets, isLoading } = useBulkJobAction(
        { viewId, ticketIds, hasSelectedAll },
    )

    const count = ticketIds.length
    const ticketWord = count === 1 ? 'ticket' : 'tickets'

    const handleMarkAsUnread = useCallback(async () => {
        await createJob(
            JobType.UpdateTicket,
            { is_unread: true },
            { is_unread: true },
            `${count} ${ticketWord} marked as unread`,
        )
        onActionComplete()
    }, [count, createJob, onActionComplete, ticketWord])

    const handleMarkAsRead = useCallback(async () => {
        await createJob(
            JobType.UpdateTicket,
            { is_unread: false },
            { is_unread: false },
            `${count} ${ticketWord} marked as read`,
        )
        onActionComplete()
    }, [count, createJob, onActionComplete, ticketWord])

    const handleChangePriority = useCallback(
        async (priority: TicketPriority) => {
            await createJob(
                JobType.UpdateTicket,
                { priority },
                { priority },
                `${count} ${ticketWord} will be marked as ${priority} priority`,
            )
            onActionComplete()
        },
        [count, createJob, onActionComplete, ticketWord],
    )

    const handleCloseTickets = useCallback(async () => {
        await createJob(
            JobType.UpdateTicket,
            { status: TicketStatus.Closed },
            { status: TicketStatus.Closed },
        )
        onActionComplete()
    }, [createJob, onActionComplete])

    const handleMoveToTrash = useCallback(async () => {
        await createJobRemovingTickets(JobType.DeleteTicket)
        onActionComplete()
    }, [createJobRemovingTickets, onActionComplete])

    const handleExportTickets = useCallback(async () => {
        await createJob(
            JobType.ExportTicket,
            undefined,
            undefined,
            'Tickets exported. You will receive the download link via email once the export is done.',
        )
        onActionComplete()
    }, [createJob, onActionComplete])

    return {
        isLoading,
        handleMarkAsUnread,
        handleMarkAsRead,
        handleChangePriority,
        handleCloseTickets,
        handleMoveToTrash,
        handleExportTickets,
    }
}
