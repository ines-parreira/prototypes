import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { JobType } from '@gorgias/helpdesk-queries'

import type { Update } from 'jobs'
import { useBulkAction } from 'jobs'

import AssignUser from './AssignUser'
import CloseTickets from './CloseTickets'
import MoreActions from './MoreActions'
import type { Action, Job } from './types'

import css from './style.less'

export default function BulkActions({
    hasSelectedAll,
    onComplete,
    selectedTickets,
    selectionCount,
}: {
    hasSelectedAll: boolean
    onComplete: (action?: Action) => void
    selectedTickets: Record<number, boolean>
    selectionCount: number | null
}) {
    const ticketIds = useMemo(
        () =>
            Object.entries(selectedTickets).reduce<number[]>(
                (ids, [id, isSelected]) =>
                    isSelected ? [...ids, parseInt(id)] : ids,
                [],
            ),
        [selectedTickets],
    )
    const isDisabled = useMemo(
        () => !hasSelectedAll && !ticketIds.length,
        [hasSelectedAll, ticketIds],
    )

    const { createJob, isLoading } = useBulkAction(
        hasSelectedAll ? 'view' : 'ticket',
        ticketIds,
    )

    const launchJob = useCallback(
        (
            job: Pick<Job, 'type' | 'event'>,
            params?: {
                updates: XOR<Update>
            },
            action?: Action,
        ) => {
            createJob(job.type!, params)
            const [entry] = Object.entries(params?.updates ?? {})

            logEvent(SegmentEvent.BulkAction, {
                type: job.event,
                location: 'split-view-mode',
                ...(['is_unread', 'status'].includes(entry?.[0])
                    ? {
                          value: entry?.[1] as
                              | Update['status']
                              | Update['is_unread'],
                      }
                    : {}),
            })
            onComplete(action)
        },
        [createJob, onComplete],
    )

    return (
        <div className={css.bulkActions}>
            <CloseTickets
                isDisabled={isLoading || isDisabled}
                onClick={() =>
                    launchJob(
                        { type: JobType.UpdateTicket, event: 'status' },
                        { updates: { status: 'closed' } },
                    )
                }
            />
            <AssignUser
                isDisabled={isLoading || isDisabled}
                onClick={(agent) =>
                    launchJob(
                        { type: JobType.UpdateTicket, event: 'assignee_user' },
                        {
                            updates: {
                                assignee_user: agent
                                    ? {
                                          id: agent.id!,
                                          name: agent.name!,
                                      }
                                    : null,
                            },
                        },
                    )
                }
            />
            <MoreActions
                isDisabled={isLoading || isDisabled}
                isLoading={isLoading}
                launchJob={launchJob}
                selectionCount={selectionCount}
                onComplete={onComplete}
                ticketIds={ticketIds}
            />
        </div>
    )
}
