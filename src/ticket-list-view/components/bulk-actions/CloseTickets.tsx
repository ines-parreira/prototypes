import React, {useCallback} from 'react'
import {JobType} from '@gorgias/api-queries'

import {useBulkAction} from 'jobs'
import IconButton from 'pages/common/components/button/IconButton'

export default function CloseTickets({
    onComplete,
    ticketIds,
}: {
    onComplete: () => void
    ticketIds: number[]
}) {
    const {createJob, isLoading} = useBulkAction({
        jobType: JobType.UpdateTicket,
        level: ticketIds?.length ? 'ticket' : 'view',
        params: {
            updates: {status: 'closed'},
        },
        ticketIds,
    })

    const closeTickets = useCallback(async () => {
        await createJob()
        onComplete()
    }, [onComplete, createJob])

    return (
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
    )
}
