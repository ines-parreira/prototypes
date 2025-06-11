import { useCallback, useEffect, useMemo, useState } from 'react'

import {
    TicketSummaryProperty,
    useGenerateTicketSummary,
} from '@gorgias/helpdesk-queries'

import { useTimeout } from 'hooks/useTimeout'
import { isGorgiasApiError } from 'models/api/types'
import socketManager from 'services/socketManager/socketManager'
import { JoinEventType } from 'services/socketManager/types'

const CLEAR_ERROR_TIMEOUT = 5000

export const useTicketSummary = ({
    ticketId,
    initialSummary,
    generateOnMountIfMissing = false,
}: {
    ticketId: number
    initialSummary?: TicketSummaryProperty
    generateOnMountIfMissing?: boolean
}) => {
    const [summary, setSummary] = useState<TicketSummaryProperty | undefined>(
        () => initialSummary,
    )

    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [isRetriable, setIsRetriable] = useState(true)
    const [setTimeout] = useTimeout()

    const { mutate: generateSummary } = useGenerateTicketSummary()

    const requestSummary = useCallback(() => {
        setErrorMessage('')
        setIsRetriable(true)
        setIsLoading(true)
        generateSummary(
            { ticketId, data: {} },
            {
                onError: (err: unknown) => {
                    const apiError = isGorgiasApiError(err) ? err : undefined
                    const fallbackMessage =
                        'Sorry, something went wrong. We were unable to generate a summary'
                    const message =
                        apiError?.response?.data?.error?.msg || fallbackMessage
                    setErrorMessage(message)
                    setIsRetriable(apiError?.status !== 403)

                    if (summary?.content) {
                        setTimeout(
                            () => setErrorMessage(''),
                            CLEAR_ERROR_TIMEOUT,
                        )
                    }
                    setIsLoading(false)
                },
            },
        )
    }, [setTimeout, ticketId, summary?.content, generateSummary])

    const hasRequested = useMemo(
        () => Boolean(!!summary || isLoading || !!errorMessage),
        [summary, isLoading, errorMessage],
    )

    useEffect(() => {
        if (initialSummary?.updated_datetime !== summary?.updated_datetime) {
            setSummary(initialSummary)
            setErrorMessage('')
            setIsRetriable(true)
            setIsLoading(false)
        }
    }, [initialSummary, summary?.updated_datetime])

    useEffect(() => {
        if (!summary && generateOnMountIfMissing) {
            requestSummary()
        }
    }, [summary, requestSummary, generateOnMountIfMissing])

    useEffect(() => {
        socketManager.join(JoinEventType.Ticket, ticketId)
        return () => socketManager.leave(JoinEventType.Ticket, ticketId)
    }, [ticketId])

    return {
        summary,
        isLoading,
        errorMessage,
        isRetriable,
        requestSummary,
        hasRequested,
    }
}

export default useTicketSummary
