import { useState } from 'react'

import { reportError } from '@repo/logging'

import { createJob } from 'models/job/resources'
import { JobType } from 'models/job/types'

export const useExportOpportunityTickets = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [isRequested, setIsRequested] = useState(false)

    const exportTickets = async (ticketIds: string[]) => {
        setIsLoading(true)
        setIsRequested(true)
        setIsError(false)

        try {
            const numericTicketIds = ticketIds.map((id) => Number(id))

            await createJob({
                type: JobType.ExportTicket,
                params: {
                    ticket_ids: numericTicketIds,
                },
            })

            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            setIsError(true)
            reportError(error, {
                extra: {
                    context: 'Export opportunity tickets',
                    ticketCount: ticketIds.length,
                },
            })
        }
    }

    const resetState = () => {
        setIsLoading(false)
        setIsError(false)
        setIsRequested(false)
    }

    return {
        exportTickets,
        isLoading,
        isError,
        isRequested,
        resetState,
    }
}
