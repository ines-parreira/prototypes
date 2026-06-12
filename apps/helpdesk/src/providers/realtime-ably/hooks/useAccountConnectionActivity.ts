import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Duration, throttle } from '@gorgias/toolkit'
import type { AccountConnectionPresenceData } from './types'

// Mirrors apps/helpdesk/src/services/userActivityManager.ts, with the added
// constraint that presence data is only updated on active/inactive transitions.
export const CONNECTION_UNAVAILABILITY_TIMEOUT = Duration.minutes(10)
export const CONNECTION_ACTIVITY_WATCH_THROTTLING = Duration.seconds(15)
const CONNECTION_ACTIVE_EVENTS = ['mousemove', 'touchstart', 'keydown'] as const

type UpdateAccountConnectionPresenceData = (
    presenceData: AccountConnectionPresenceData,
) => Promise<void>

export function useAccountConnectionActivity(
    updatePresenceData: UpdateAccountConnectionPresenceData,
) {
    const connectionActiveRef = useRef(true)
    const connectionActiveTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null)

    const updateConnectionActive = useCallback(
        (connectionActive: boolean) => {
            if (connectionActiveRef.current === connectionActive) return

            connectionActiveRef.current = connectionActive
            void updatePresenceData({ connectionActive })
        },
        [updatePresenceData],
    )

    const resetConnectionActiveTimeout = useCallback(() => {
        if (connectionActiveTimeoutRef.current) {
            clearTimeout(connectionActiveTimeoutRef.current)
        }

        updateConnectionActive(true)
        connectionActiveTimeoutRef.current = setTimeout(() => {
            updateConnectionActive(false)
        }, CONNECTION_UNAVAILABILITY_TIMEOUT)
    }, [updateConnectionActive])

    const throttledResetConnectionActiveTimeout = useMemo(
        () =>
            throttle(
                resetConnectionActiveTimeout,
                CONNECTION_ACTIVITY_WATCH_THROTTLING,
            ),
        [resetConnectionActiveTimeout],
    )

    useEffect(() => {
        CONNECTION_ACTIVE_EVENTS.forEach((eventName) => {
            document.addEventListener(
                eventName,
                throttledResetConnectionActiveTimeout,
            )
        })

        throttledResetConnectionActiveTimeout()

        return () => {
            CONNECTION_ACTIVE_EVENTS.forEach((eventName) => {
                document.removeEventListener(
                    eventName,
                    throttledResetConnectionActiveTimeout,
                )
            })
            throttledResetConnectionActiveTimeout.cancel()

            if (connectionActiveTimeoutRef.current) {
                clearTimeout(connectionActiveTimeoutRef.current)
            }
        }
    }, [throttledResetConnectionActiveTimeout])
}
