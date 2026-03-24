import { useCallback, useEffect, useState } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetTestSessionLogs } from 'models/aiAgent/queries'

const POLLING_INTERVAL = 5000
const POLLING_TIMEOUT = 5 * 60 * 1000 // 5 minutes in milliseconds

export const usePlaygroundPolling = ({
    testSessionId,
    baseUrl,
    useV3 = false,
}: {
    testSessionId?: string
    baseUrl?: string
    useV3?: boolean
}) => {
    const [isPolling, setIsPolling] = useState(!!testSessionId)

    useEffectOnce(() => {
        // guarantees 1 fetch for the logs if the session id is provided
        // when the playground is first started.
        if (!!testSessionId) {
            setIsPolling(false)
        }
    })

    const { data: testSessionLogs, error } = useGetTestSessionLogs(
        testSessionId ?? '',
        useV3,
        {
            enabled: !!isPolling,
            refetchInterval: POLLING_INTERVAL,
            baseUrl,
        },
    )

    useEffect(() => {
        if (testSessionLogs?.status === 'finished') {
            setIsPolling(false)
        }
    }, [testSessionLogs?.status])

    const startPolling = useCallback(() => {
        setIsPolling(true)

        const timeoutId = setTimeout(() => {
            setIsPolling(false)
        }, POLLING_TIMEOUT)

        // Clean up timeout if polling stops for other reasons
        return () => clearTimeout(timeoutId)
    }, [])

    const stopPolling = useCallback(() => {
        setIsPolling(false)
    }, [])

    useEffect(() => {
        return () => {
            stopPolling()
        }
    }, [stopPolling])

    useEffect(() => {
        if (error) {
            setIsPolling(false)
            reportError(error, {
                tags: {
                    team: SentryTeam.AI_AGENT,
                    testSessionId,
                },
            })
        }
    }, [error, testSessionId])

    return {
        testSessionLogs,
        isPolling,
        startPolling,
        stopPolling,
    }
}
