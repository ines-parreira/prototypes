import React, {useCallback, useMemo} from 'react'
import {JobType} from '@gorgias/api-queries'

import {useBulkAction} from 'jobs'
import IconButton from 'pages/common/components/button/IconButton'

import css from './BulkActions.less'

export default function BulkActions({
    clearSelection,
    selectedTickets,
}: {
    clearSelection: () => void
    selectedTickets: Record<number, boolean>
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
    const {createJob, isLoading} = useBulkAction({
        jobType: JobType.UpdateTicket,
        level: ticketIds.length ? 'ticket' : 'view',
        params: {
            updates: {status: 'closed'},
        },
        ticketIds,
    })

    const closeTickets = useCallback(async () => {
        await createJob()
        clearSelection()
    }, [clearSelection, createJob])

    return (
        <div className={css.bulkActions}>
            <IconButton
                size="small"
                fillStyle="ghost"
                intent="secondary"
                onClick={closeTickets}
                isDisabled={isLoading}
                title="Close tickets"
            >
                check_circle
            </IconButton>
        </div>
    )
}
