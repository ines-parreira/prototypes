import { useCallback, useEffect, useRef } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { Button, toast } from '@gorgias/axiom'
import type { RealtimeConnectionStateChange } from '@gorgias/realtime'

const REALTIME_CONNECTION_TOAST_ID = 'realtime-connection-error'
const REALTIME_CONNECTION_TOAST_TITLE = 'Unable to connect to real-time updates'
const REALTIME_CONNECTION_TOAST_CAPTION =
    'Please check your internet connection and refresh the browser.'
export const REALTIME_DISCONNECTED_TOAST_DELAY_MS = 8000

export const useRealtimeConnectionStateChanges = () => {
    const disconnectedToastTimeout = useRef<NodeJS.Timeout | null>(null)
    const trackedRealtimeConnectionState = useRef<
        RealtimeConnectionStateChange['current'] | null
    >(null)

    const clearDisconnectedToastTimeout = useCallback(() => {
        if (disconnectedToastTimeout.current) {
            clearTimeout(disconnectedToastTimeout.current)
            disconnectedToastTimeout.current = null
        }
    }, [])

    useEffect(() => {
        return () => {
            clearDisconnectedToastTimeout()
            trackedRealtimeConnectionState.current = null
        }
    }, [clearDisconnectedToastTimeout])

    const showRealtimeConnectionToast = useCallback(
        (
            current: RealtimeConnectionStateChange['current'],
            previous: RealtimeConnectionStateChange['previous'],
        ) => {
            if (trackedRealtimeConnectionState.current !== current) {
                logEvent(SegmentEvent.RealtimeConnectivityBannerDisplayed, {
                    currentState: current,
                    previousState: previous,
                })

                trackedRealtimeConnectionState.current = current
            }

            toast.error(REALTIME_CONNECTION_TOAST_TITLE, {
                caption: REALTIME_CONNECTION_TOAST_CAPTION,
                id: REALTIME_CONNECTION_TOAST_ID,
                duration: Infinity,
                onDismiss: () => {
                    // Manual dismiss logs hidden; auto-hide clears the tracked state first.
                    if (trackedRealtimeConnectionState.current !== null) {
                        logEvent(
                            SegmentEvent.RealtimeConnectivityBannerHidden,
                            {
                                currentState: current,
                                previousState: previous,
                            },
                        )
                    }

                    trackedRealtimeConnectionState.current = null
                },
                actions: ({ id }) => (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                            logEvent(
                                SegmentEvent.RealtimeConnectivityBannerRefreshClicked,
                                {
                                    currentState: current,
                                    previousState: previous,
                                },
                            )
                            toast.dismiss(id)
                            window.location.reload()
                        }}
                    >
                        Reload page
                    </Button>
                ),
            })
        },
        [],
    )

    const scheduleDisconnectedToast = useCallback(
        (
            current: RealtimeConnectionStateChange['current'],
            previous: RealtimeConnectionStateChange['previous'],
        ) => {
            if (disconnectedToastTimeout.current) {
                return
            }

            disconnectedToastTimeout.current = setTimeout(() => {
                showRealtimeConnectionToast(current, previous)
                disconnectedToastTimeout.current = null
            }, REALTIME_DISCONNECTED_TOAST_DELAY_MS)
        },
        [showRealtimeConnectionToast],
    )

    const onRealtimeConnectionStateChange = useCallback(
        (stateChange: RealtimeConnectionStateChange) => {
            switch (stateChange.current) {
                case 'disconnected': {
                    scheduleDisconnectedToast(
                        stateChange.current,
                        stateChange.previous,
                    )
                    break
                }
                case 'suspended': {
                    clearDisconnectedToastTimeout()
                    showRealtimeConnectionToast(
                        stateChange.current,
                        stateChange.previous,
                    )
                    break
                }
                case 'failed': {
                    clearDisconnectedToastTimeout()
                    showRealtimeConnectionToast(
                        stateChange.current,
                        stateChange.previous,
                    )
                    break
                }
                case 'connected':
                case 'closed': {
                    clearDisconnectedToastTimeout()
                    if (trackedRealtimeConnectionState.current !== null) {
                        logEvent(
                            SegmentEvent.RealtimeConnectivityBannerAutoHidden,
                            {
                                currentState: stateChange.current,
                                previousState: stateChange.previous,
                            },
                        )
                    }
                    trackedRealtimeConnectionState.current = null
                    toast.dismiss(REALTIME_CONNECTION_TOAST_ID)
                    break
                }
                default: {
                    clearDisconnectedToastTimeout()
                }
            }
        },
        [
            clearDisconnectedToastTimeout,
            scheduleDisconnectedToast,
            showRealtimeConnectionToast,
        ],
    )

    return { onRealtimeConnectionStateChange }
}
