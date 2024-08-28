import React, {useCallback, useMemo} from 'react'
import {JobType} from '@gorgias/api-queries'

import {logEvent, SegmentEvent} from 'common/segment'
import {Item} from 'components/Dropdown'
import {Update, useBulkAction} from 'jobs'

import ApplyMacro from './ApplyMacro'
import CloseTickets from './CloseTickets'
import MoreActions from './MoreActions'
import css from './style.less'

type Job = {
    label: string
    type: JobType
    params?: (item?: Item | null) => {updates: XOR<Update>}
    className?: string
    subItem?: string
    event: string
}

export enum Action {
    MarkAsUnread = 'mark_as_unread',
    MarkAsRead = 'mark_as_read',
    ExportTickets = 'export_tickets',
    Untrash = 'untrash',
    Delete = 'delete',
    Trash = 'trash',
}

export default function BulkActions({
    hasSelectedAll,
    onComplete,
    selectedTickets,
    selectionCount,
}: {
    hasSelectedAll: boolean
    onComplete: () => void
    selectedTickets: Record<number, boolean>
    selectionCount: number | null
}) {
    const ticketIds = useMemo(
        () =>
            Object.entries(selectedTickets).reduce<number[]>(
                (ids, [id, isSelected]) =>
                    isSelected ? [...ids, parseInt(id)] : ids,
                []
            ),
        [selectedTickets]
    )
    const isDisabled = useMemo(
        () => !hasSelectedAll && !ticketIds.length,
        [hasSelectedAll, ticketIds]
    )

    const {createJob, isLoading} = useBulkAction(
        hasSelectedAll ? 'view' : 'ticket',
        ticketIds
    )

    const launchJob = useCallback(
        async (
            action: Pick<Job, 'type' | 'event'>,
            params?: {
                updates: XOR<Update>
            }
        ) => {
            await createJob(action.type, params)
            const [entry] = Object.entries(params?.updates ?? {})

            logEvent(SegmentEvent.BulkAction, {
                type: action.event,
                location: 'split-view-mode',
                ...(['is_unread', 'status'].includes(entry?.[0])
                    ? {
                          value: entry?.[1] as
                              | Update['status']
                              | Update['is_unread'],
                      }
                    : {}),
            })
            onComplete()
        },
        [createJob, onComplete]
    )

    const onApplyMacro = useCallback(() => {
        logEvent(SegmentEvent.BulkAction, {
            type: 'apply-macro',
            location: 'split-view-mode',
        })
        onComplete()
    }, [onComplete])

    return (
        <div className={css.bulkActions}>
            <CloseTickets
                isDisabled={isLoading || isDisabled}
                onClick={() =>
                    launchJob(
                        {type: JobType.UpdateTicket, event: 'status'},
                        {updates: {status: 'closed'}}
                    )
                }
            />
            <ApplyMacro
                isDisabled={isLoading || isDisabled}
                onComplete={onApplyMacro}
                ticketIds={ticketIds}
            />
            <MoreActions
                isDisabled={isLoading || isDisabled}
                isLoading={isLoading}
                launchJob={launchJob}
                selectionCount={selectionCount}
            />
        </div>
    )
}
