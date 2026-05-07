import { useCallback, useEffect, useRef, useState } from 'react'

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
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
        if (
            testSessionLogs?.status === 'finished' ||
            testSessionLogs?.status === 'idle'
        ) {
            setIsPolling(false)
        }
    }, [testSessionLogs?.status])

    const startPolling = useCallback(() => {
        setIsPolling(true)

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
            setIsPolling(false)
        }, POLLING_TIMEOUT)
    }, [])

    const stopPolling = useCallback(() => {
        setIsPolling(false)
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [])

    useEffect(() => {
        return () => {
            stopPolling()
        }
    }, [stopPolling])

    useEffect(() => {
        if (testSessionId && !timeoutRef.current) {
            timeoutRef.current = setTimeout(() => {
                setIsPolling(false)
            }, POLLING_TIMEOUT)
        }
    }, [testSessionId])

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
