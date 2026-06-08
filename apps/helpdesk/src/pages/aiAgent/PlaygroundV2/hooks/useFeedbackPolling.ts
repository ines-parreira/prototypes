import { useCallback, useEffect, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetFeedback } from 'models/knowledgeService/queries'

export const useFeedbackPolling = ({
    executionId,
}: {
    executionId: string
}) => {
    const [isPolling, setIsPolling] = useState(false)

    const { data: feedback, error } = useGetFeedback(
        {
            executionId,
            objectType: 'TICKET',
        },
        {
            enabled: !!isPolling,
            refetchInterval: Duration.seconds(5),
        },
    )

    useEffect(() => {
        // Stop polling if we have executions data
        if (feedback?.executions && feedback.executions.length > 0) {
            setIsPolling(false)
        }
    }, [feedback?.executions])

    const startPolling = useCallback(() => {
        setIsPolling(true)

        const timeoutId = setTimeout(() => {
            setIsPolling(false)
        }, Duration.minutes(2))

        // Clean up timeout if polling stops for other reasons
        return () => clearTimeout(timeoutId)
    }, [])

    const stopPolling = useCallback(() => {
        setIsPolling(false)
    }, [])

    useEffect(() => {
        if (error) {
            setIsPolling(false)
            reportError(error, {
                tags: {
                    team: SentryTeam.AI_AGENT,
                    executionId,
                },
                extra: {
                    context: 'Error during feedback polling',
                },
            })
        }
    }, [error, executionId])

    return {
        feedback,
        isPolling,
        startPolling,
        stopPolling,
    }
}
