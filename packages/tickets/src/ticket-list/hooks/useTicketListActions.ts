import { useCallback, useMemo } from 'react'

import type {
    Team,
    TicketPriority,
    TicketTag,
    User,
} from '@gorgias/helpdesk-queries'
import { JobType } from '@gorgias/helpdesk-types'

import { TicketStatus } from '../../types/ticket'
import { useBulkJobAction } from './useBulkJobAction'

type Params = {
    viewId: number
    selectedTicketIds: Set<number>
    visibleTicketIds: number[]
    hasSelectedAll: boolean
    onActionComplete: () => void
    onApplyMacro?: (ticketIds: number[]) => void
}

type HandleUndeleteOptions = {
    removeFromCurrentViewCache?: boolean
}

export function useTicketListActions({
    viewId,
    selectedTicketIds,
    visibleTicketIds,
    hasSelectedAll,
    onActionComplete,
    onApplyMacro,
}: Params) {
    const selectedIds = useMemo(
        () => Array.from(selectedTicketIds),
        [selectedTicketIds],
    )
    const ticketIds = hasSelectedAll ? visibleTicketIds : selectedIds

    const { createJob, createJobRemovingTickets, isLoading } = useBulkJobAction(
        { viewId, ticketIds, hasSelectedAll },
    )

    const count = ticketIds.length
    const ticketWord = count === 1 ? 'ticket' : 'tickets'
    const selectionLabel = hasSelectedAll
        ? 'All tickets in this view'
        : `${count} ${ticketWord}`
    const eventualConsistencySuffix =
        ' Updates may take a few seconds to apply.'
    const withDelayNotice = useCallback(
        (message: string) => `${message}.${eventualConsistencySuffix}`,
        [eventualConsistencySuffix],
    )

    const runBulkUpdate = useCallback(
        async (
            updates: Parameters<typeof createJob>[1],
            successMessage: string,
            listCachePatch?: Parameters<typeof createJob>[3],
        ) => {
            await createJob(
                JobType.UpdateTicket,
                updates,
                successMessage,
                listCachePatch,
            )
            onActionComplete()
        },
        [createJob, onActionComplete],
    )

    const runBulkDelete = useCallback(
        async (successMessage: string) => {
            await createJobRemovingTickets(
                JobType.DeleteTicket,
                undefined,
                successMessage,
            )
            onActionComplete()
        },
        [createJobRemovingTickets, onActionComplete],
    )

    const runBulkUpdateRemovingTickets = useCallback(
        async (
            updates: Parameters<typeof createJob>[1],
            successMessage: string,
        ) => {
            await createJobRemovingTickets(
                JobType.UpdateTicket,
                updates,
                successMessage,
            )
            onActionComplete()
        },
        [createJobRemovingTickets, onActionComplete],
    )

    const handleMarkAsUnread = useCallback(async () => {
        await runBulkUpdate(
            { is_unread: true },
            `${selectionLabel} marked as unread.`,
            { is_unread: true },
        )
    }, [runBulkUpdate, selectionLabel])

    const handleMarkAsRead = useCallback(async () => {
        await runBulkUpdate(
            { is_unread: false },
            `${selectionLabel} marked as read.`,
            { is_unread: false },
        )
    }, [runBulkUpdate, selectionLabel])

    const handleChangePriority = useCallback(
        async (priority: TicketPriority) => {
            await runBulkUpdate(
                { priority },
                withDelayNotice(
                    `${selectionLabel} will be marked as ${priority} priority`,
                ),
            )
        },
        [runBulkUpdate, selectionLabel, withDelayNotice],
    )

    const handleAssignTeam = useCallback(
        async (team: Team | null) => {
            await runBulkUpdate(
                { assignee_team_id: team?.id ?? null },
                withDelayNotice(
                    team
                        ? `${selectionLabel} assigned to ${team.name}`
                        : `${selectionLabel} unassigned from team`,
                ),
            )
        },
        [runBulkUpdate, selectionLabel, withDelayNotice],
    )

    const handleAssignUser = useCallback(
        async (user: User | null) => {
            await runBulkUpdate(
                {
                    assignee_user: user
                        ? {
                              id: user.id,
                              name: user.name,
                          }
                        : null,
                },
                withDelayNotice(
                    user
                        ? `${selectionLabel} assigned to ${user.name}`
                        : `${selectionLabel} unassigned`,
                ),
            )
        },
        [runBulkUpdate, selectionLabel, withDelayNotice],
    )

    const handleAddTag = useCallback(
        async (tag: TicketTag) => {
            await runBulkUpdate(
                { tags: [tag.name] },
                withDelayNotice(`${selectionLabel} tagged with ${tag.name}`),
            )
        },
        [runBulkUpdate, selectionLabel, withDelayNotice],
    )

    const handleCloseTickets = useCallback(async () => {
        await runBulkUpdate(
            { status: TicketStatus.Closed },
            withDelayNotice(`${selectionLabel} closed`),
        )
    }, [runBulkUpdate, selectionLabel, withDelayNotice])

    const handleSetStatus = useCallback(
        async (status: TicketStatus) => {
            await runBulkUpdate(
                { status },
                withDelayNotice(
                    status === TicketStatus.Open
                        ? `${selectionLabel} reopened`
                        : `${selectionLabel} closed`,
                ),
            )
        },
        [runBulkUpdate, selectionLabel, withDelayNotice],
    )

    const handleMoveToTrash = useCallback(async () => {
        await runBulkUpdate(
            { trashed_datetime: new Date().toISOString() },
            `${selectionLabel} moved to trash.`,
        )
    }, [runBulkUpdate, selectionLabel])

    const handleUndelete = useCallback(
        async (options?: HandleUndeleteOptions) => {
            if (options?.removeFromCurrentViewCache) {
                await runBulkUpdateRemovingTickets(
                    { trashed_datetime: null },
                    `${selectionLabel} restored from trash.`,
                )
                return
            }

            await runBulkUpdate(
                { trashed_datetime: null },
                `${selectionLabel} restored from trash.`,
            )
        },
        [runBulkUpdate, runBulkUpdateRemovingTickets, selectionLabel],
    )

    const handleDeleteForever = useCallback(async () => {
        await runBulkDelete(`${selectionLabel} deleted forever.`)
    }, [runBulkDelete, selectionLabel])

    const handleExportTickets = useCallback(async () => {
        await createJob(
            JobType.ExportTicket,
            undefined,
            'Tickets exported. You will receive the download link via email once the export is done.',
        )
        onActionComplete()
    }, [createJob, onActionComplete])

    const handleApplyMacro = useCallback(() => {
        onApplyMacro?.(hasSelectedAll ? [] : selectedIds)
        onActionComplete()
    }, [onApplyMacro, hasSelectedAll, selectedIds, onActionComplete])

    return {
        isLoading,
        handleMarkAsUnread,
        handleMarkAsRead,
        handleChangePriority,
        handleAssignTeam,
        handleAssignUser,
        handleAddTag,
        handleSetStatus,
        handleCloseTickets,
        handleMoveToTrash,
        handleUndelete,
        handleDeleteForever,
        handleExportTickets,
        handleApplyMacro,
    }
}
