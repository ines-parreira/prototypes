import { logEvent, SegmentEvent } from '@repo/logging'
import { renderHook } from '@repo/testing'
import { act, screen, waitFor, within } from '@testing-library/react'

import { toast } from '@gorgias/axiom'

import {
    REALTIME_DISCONNECTED_TOAST_DELAY_MS,
    useRealtimeConnectionStateChanges,
} from '../useRealtimeConnectionStateChanges'

jest.mock('@repo/logging')

const mockLogEvent = logEvent as jest.Mock
const toastDismissSpy = jest.spyOn(toast, 'dismiss')
const toastErrorSpy = jest.spyOn(toast, 'error')
type OnRealtimeConnectionStateChange = ReturnType<
    typeof useRealtimeConnectionStateChanges
>['onRealtimeConnectionStateChange']
type RealtimeConnectionStateChangeArg =
    Parameters<OnRealtimeConnectionStateChange>[0]
const HALF_REALTIME_DISCONNECTED_TOAST_DELAY_MS =
    REALTIME_DISCONNECTED_TOAST_DELAY_MS / 2
const REALTIME_CONNECTION_TOAST_TITLE = 'Unable to connect to real-time updates'

const queryRealtimeConnectionToast = () =>
    screen.queryByRole('status', {
        name: REALTIME_CONNECTION_TOAST_TITLE,
    })

describe('useRealtimeConnectionStateChanges', () => {
    let originalLocation: Location

    beforeEach(() => {
        originalLocation = window.location
        ;(window as unknown as { location: Location }).location = {
            ...originalLocation,
            reload: jest.fn(),
        }

        mockLogEvent.mockClear()
        toastDismissSpy.mockClear()
        toastErrorSpy.mockClear()
    })

    afterEach(() => {
        act(() => {
            toast.dismiss()
        })
        ;(window as unknown as { location: Location }).location =
            originalLocation
        jest.useRealTimers()
    })

    it('should show a persistent toast when disconnected lasts 8 seconds', async () => {
        jest.useFakeTimers()

        const { result } = renderHook(() => useRealtimeConnectionStateChanges())

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'disconnected',
                previous: 'connected',
            } as RealtimeConnectionStateChangeArg)
        })

        expect(queryRealtimeConnectionToast()).not.toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(REALTIME_DISCONNECTED_TOAST_DELAY_MS)
        })

        await waitFor(() => {
            expect(queryRealtimeConnectionToast()).toBeInTheDocument()
        })

        expect(mockLogEvent).not.toHaveBeenCalled()
    })

    it('should cancel the delayed disconnected toast when realtime reconnects before 8 seconds', () => {
        jest.useFakeTimers()

        const { result } = renderHook(() => useRealtimeConnectionStateChanges())

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'disconnected',
                previous: 'connected',
            } as RealtimeConnectionStateChangeArg)
        })

        act(() => {
            jest.advanceTimersByTime(HALF_REALTIME_DISCONNECTED_TOAST_DELAY_MS)
        })

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'connected',
                previous: 'disconnected',
            } as RealtimeConnectionStateChangeArg)
        })

        act(() => {
            jest.advanceTimersByTime(HALF_REALTIME_DISCONNECTED_TOAST_DELAY_MS)
        })

        expect(queryRealtimeConnectionToast()).not.toBeInTheDocument()
        expect(mockLogEvent).not.toHaveBeenCalled()
    })

    it.each(['connected', 'closed'] as const)(
        'should hide the connection toast when realtime becomes %s',
        async (currentState) => {
            const { result } = renderHook(() =>
                useRealtimeConnectionStateChanges(),
            )

            act(() => {
                result.current.onRealtimeConnectionStateChange({
                    current: 'suspended',
                    previous: 'connecting',
                } as RealtimeConnectionStateChangeArg)
            })

            await waitFor(() => {
                expect(queryRealtimeConnectionToast()).toBeInTheDocument()
            })

            act(() => {
                result.current.onRealtimeConnectionStateChange({
                    current: currentState,
                    previous: 'disconnected',
                } as RealtimeConnectionStateChangeArg)
            })

            expect(mockLogEvent).toHaveBeenNthCalledWith(
                1,
                SegmentEvent.RealtimeConnectivityBannerDisplayed,
                {
                    currentState: 'suspended',
                    previousState: 'connecting',
                },
            )

            if (currentState === 'connected') {
                expect(mockLogEvent).toHaveBeenNthCalledWith(
                    2,
                    SegmentEvent.RealtimeConnectivityBannerAutoHidden,
                    {
                        currentState,
                        previousState: 'disconnected',
                    },
                )
            }

            expect(mockLogEvent).toHaveBeenCalledTimes(
                currentState === 'connected' ? 2 : 1,
            )
            expect(toastDismissSpy).toHaveBeenCalledWith(
                'realtime-connection-error',
            )
        },
    )

    it.each(['suspended', 'failed'] as const)(
        'should show the toast immediately and track when the connection is %s',
        async (currentState) => {
            const { result } = renderHook(() =>
                useRealtimeConnectionStateChanges(),
            )

            act(() => {
                result.current.onRealtimeConnectionStateChange({
                    current: currentState,
                    previous: 'connecting',
                } as RealtimeConnectionStateChangeArg)
            })

            await waitFor(() => {
                expect(queryRealtimeConnectionToast()).toBeInTheDocument()
            })

            expect(
                within(queryRealtimeConnectionToast() as HTMLElement).getByRole(
                    'button',
                    {
                        name: 'Reload page',
                    },
                ),
            ).toBeInTheDocument()
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.RealtimeConnectivityBannerDisplayed,
                {
                    currentState,
                    previousState: 'connecting',
                },
            )
        },
    )

    it('should show the toast immediately for a listed state even if a disconnected toast is pending', async () => {
        jest.useFakeTimers()

        const { result } = renderHook(() => useRealtimeConnectionStateChanges())

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'disconnected',
                previous: 'connected',
            } as RealtimeConnectionStateChangeArg)
        })

        act(() => {
            jest.advanceTimersByTime(HALF_REALTIME_DISCONNECTED_TOAST_DELAY_MS)
        })

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'failed',
                previous: 'disconnected',
            } as RealtimeConnectionStateChangeArg)
        })

        await waitFor(() => {
            expect(queryRealtimeConnectionToast()).toBeInTheDocument()
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.RealtimeConnectivityBannerDisplayed,
            {
                currentState: 'failed',
                previousState: 'disconnected',
            },
        )
        expect(
            screen.getAllByRole('status', {
                name: REALTIME_CONNECTION_TOAST_TITLE,
            }),
        ).toHaveLength(1)
    })

    it('should not log the toast display event again for the same tracked state', async () => {
        jest.useFakeTimers()

        const { result } = renderHook(() => useRealtimeConnectionStateChanges())

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'suspended',
                previous: 'disconnected',
            } as RealtimeConnectionStateChangeArg)
        })

        await waitFor(() => {
            expect(queryRealtimeConnectionToast()).toBeInTheDocument()
        })

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'connecting',
                previous: 'disconnected',
            } as RealtimeConnectionStateChangeArg)
        })

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'suspended',
                previous: 'connecting',
            } as RealtimeConnectionStateChangeArg)
        })

        expect(mockLogEvent).toHaveBeenCalledTimes(1)
    })

    it('should log failed and allow suspended to log again after failed', async () => {
        const { result } = renderHook(() => useRealtimeConnectionStateChanges())

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'suspended',
                previous: 'disconnected',
            } as RealtimeConnectionStateChangeArg)
        })

        await waitFor(() => {
            expect(queryRealtimeConnectionToast()).toBeInTheDocument()
        })

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'failed',
                previous: 'suspended',
            } as RealtimeConnectionStateChangeArg)
        })

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'suspended',
                previous: 'failed',
            } as RealtimeConnectionStateChangeArg)
        })

        expect(mockLogEvent).toHaveBeenNthCalledWith(
            1,
            SegmentEvent.RealtimeConnectivityBannerDisplayed,
            {
                currentState: 'suspended',
                previousState: 'disconnected',
            },
        )
        expect(mockLogEvent).toHaveBeenNthCalledWith(
            2,
            SegmentEvent.RealtimeConnectivityBannerDisplayed,
            {
                currentState: 'failed',
                previousState: 'suspended',
            },
        )
        expect(mockLogEvent).toHaveBeenNthCalledWith(
            3,
            SegmentEvent.RealtimeConnectivityBannerDisplayed,
            {
                currentState: 'suspended',
                previousState: 'failed',
            },
        )
    })

    it('should not track disconnected churn after suspended without reconnecting', async () => {
        jest.useFakeTimers()

        const { result } = renderHook(() => useRealtimeConnectionStateChanges())

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'suspended',
                previous: 'disconnected',
            } as RealtimeConnectionStateChangeArg)
        })

        await waitFor(() => {
            expect(queryRealtimeConnectionToast()).toBeInTheDocument()
        })

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'connecting',
                previous: 'suspended',
            } as RealtimeConnectionStateChangeArg)
        })

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'disconnected',
                previous: 'connecting',
            } as RealtimeConnectionStateChangeArg)
        })

        act(() => {
            jest.advanceTimersByTime(REALTIME_DISCONNECTED_TOAST_DELAY_MS)
        })

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'suspended',
                previous: 'disconnected',
            } as RealtimeConnectionStateChangeArg)
        })

        expect(mockLogEvent).toHaveBeenCalledTimes(1)
        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.RealtimeConnectivityBannerDisplayed,
            {
                currentState: 'suspended',
                previousState: 'disconnected',
            },
        )
    })

    it('should not show a toast when the connection is still transient', () => {
        const { result } = renderHook(() => useRealtimeConnectionStateChanges())

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'connecting',
                previous: 'initialized',
            } as RealtimeConnectionStateChangeArg)
        })

        expect(queryRealtimeConnectionToast()).not.toBeInTheDocument()
    })

    it('should reload the page when clicking the toast CTA', async () => {
        const { result } = renderHook(() => useRealtimeConnectionStateChanges())

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'suspended',
                previous: 'disconnected',
            } as RealtimeConnectionStateChangeArg)
        })

        await waitFor(() => {
            expect(queryRealtimeConnectionToast()).toBeInTheDocument()
        })

        const toastElement = queryRealtimeConnectionToast() as HTMLElement

        act(() => {
            within(toastElement)
                .getByRole('button', { name: 'Reload page' })
                .click()
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.RealtimeConnectivityBannerRefreshClicked,
            {
                currentState: 'suspended',
                previousState: 'disconnected',
            },
        )
        expect(toastDismissSpy).toHaveBeenCalledWith(
            'realtime-connection-error',
        )
        expect(window.location.reload).toHaveBeenCalledTimes(1)
    })

    it('should log when the toast is dismissed', async () => {
        const { result } = renderHook(() => useRealtimeConnectionStateChanges())

        act(() => {
            result.current.onRealtimeConnectionStateChange({
                current: 'suspended',
                previous: 'disconnected',
            } as RealtimeConnectionStateChangeArg)
        })

        await waitFor(() => {
            expect(queryRealtimeConnectionToast()).toBeInTheDocument()
        })

        act(() => {
            const onDismiss = toastErrorSpy.mock.calls.at(-1)?.[1]?.onDismiss

            onDismiss?.()
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.RealtimeConnectivityBannerHidden,
            {
                currentState: 'suspended',
                previousState: 'disconnected',
            },
        )
    })
})
