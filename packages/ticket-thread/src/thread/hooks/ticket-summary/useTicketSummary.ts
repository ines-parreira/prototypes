import { useCallback, useEffect, useState } from 'react'

import { useGenerateTicketSummary } from '@gorgias/helpdesk-queries'
import type { TicketSummary } from '@gorgias/helpdesk-types'

type ApiError = {
    response?: {
        status?: number
        data?: { error?: { msg?: string } }
    }
}

function isApiError(err: unknown): err is ApiError {
    return typeof err === 'object' && err !== null
}

export const useTicketSummary = ({
    ticketId,
    initialSummary,
}: {
    ticketId: number
    initialSummary?: TicketSummary | null
}) => {
    const [summary, setSummary] = useState<TicketSummary | null | undefined>(
        () => initialSummary,
    )
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [isRetriable, setIsRetriable] = useState(true)

    const { mutate: generateSummary } = useGenerateTicketSummary()

    const requestSummary = useCallback(() => {
        setErrorMessage('')
        setIsRetriable(true)
        setIsLoading(true)
        generateSummary(
            { ticketId, data: {} },
            {
                onError: (err: unknown) => {
                    const response = isApiError(err) ? err.response : undefined
                    const fallbackMessage =
                        'Sorry, something went wrong. We were unable to generate a summary'
                    setErrorMessage(
                        response?.data?.error?.msg || fallbackMessage,
                    )
                    setIsRetriable(response?.status !== 403)
                    setIsLoading(false)
                },
            },
        )
    }, [ticketId, generateSummary])

    const initialSummaryDatetime =
        initialSummary?.updated_datetime ??
        initialSummary?.created_datetime ??
        null
    const summaryDatetime =
        summary?.updated_datetime ?? summary?.created_datetime ?? null

    useEffect(() => {
        if (initialSummaryDatetime !== summaryDatetime) {
            setSummary(initialSummary)
            setErrorMessage('')
            setIsRetriable(true)
            setIsLoading(false)
        }
    }, [initialSummary, initialSummaryDatetime, summaryDatetime])

    return { summary, isLoading, errorMessage, isRetriable, requestSummary }
}
