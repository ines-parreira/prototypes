import { assumeMock, renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { act } from 'react-dom/test-utils'
import { useInterval } from '@gorgias/toolkit-react'

import {
    mockEndWrapUpTimeHandler,
    mockGetAgentWrapUpCallStatusHandler,
    mockGetAgentWrapUpCallStatusResponse,
} from '@gorgias/helpdesk-mocks'

import { useVoiceDevice } from 'hooks/integrations/phone/useVoiceDevice'
import type { VoiceCall } from 'models/voiceCall/types'
import { socketManager } from 'services/socketManager'
import { SocketEventType } from 'services/socketManager/types'

import { useWrapUpTime } from '../useWrapUpTime'

jest.mock('hooks/integrations/phone/useVoiceDevice')
jest.mock('services/socketManager', () => ({
    socketManager: {
        registerReceivedEvents: jest.fn(),
        unregisterReceivedEvents: jest.fn(),
    },
}))
jest.mock('@gorgias/toolkit-react', () => ({
    ...jest.requireActual('@gorgias/toolkit-react'),
    useInterval: jest.fn(),
}))

const FIXED_DATE = '2023-01-01T12:05:00Z'
const FIXED_TIMESTAMP = new Date(FIXED_DATE).getTime()

jest.spyOn(Date, 'now').mockImplementation(() => FIXED_TIMESTAMP)

jest.mock('moment-timezone', () => {
    const moment: ((
        date?: string,
        format?: string,
    ) => Record<string, unknown>) & { utc: () => unknown } =
        jest.requireActual('moment-timezone')
    const fn = (...args: any[]) =>
        args.length > 0 ? moment(...args) : moment(FIXED_DATE)
    fn.utc = moment.utc

    return fn
})

const useIntervalMock = assumeMock(useInterval)
const useVoiceDeviceMock = assumeMock(useVoiceDevice)

const defaultAgentWrapUpStatus = mockGetAgentWrapUpCallStatusResponse({
    agent_id: null,
    call_id: null,
    call_sid: null,
    created_datetime: null,
    expiration_datetime: null,
    integration_id: null,
    is_wrapping_up: false,
    status: null,
})
const server = setupServer()

describe('useWrapUpTime', () => {
    const mockVoiceCall: Partial<VoiceCall> = {
        integration_id: 123,
        external_id: 'test-call-sid',
    }

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
        server.use(
            mockGetAgentWrapUpCallStatusHandler(async () =>
                HttpResponse.json(defaultAgentWrapUpStatus),
            ).handler,
            mockEndWrapUpTimeHandler().handler,
        )
        useVoiceDeviceMock.mockReturnValue({
            call: null,
            device: null,
            actions: {},
        } as any)
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should register socket event on mount', () => {
        renderHook(() => useWrapUpTime())

        expect(socketManager.registerReceivedEvents).toHaveBeenCalledWith([
            {
                name: SocketEventType.VoiceCallWrapUpTimeStarted,
                onReceive: expect.any(Function),
            },
        ])
    })

    it('should unregister socket event on unmount', () => {
        const { unmount } = renderHook(() => useWrapUpTime())
        unmount()

        expect(socketManager.unregisterReceivedEvents).toHaveBeenCalledWith([
            {
                name: SocketEventType.VoiceCallWrapUpTimeStarted,
                onReceive: expect.any(Function),
            },
        ])
    })

    it('should return default values when no wrap-up is in progress', () => {
        const { result } = renderHook(() => useWrapUpTime())

        expect(result.current).toEqual({
            isWrappingUp: false,
            timeLeft: null,
            voiceCall: null,
            endWrapUpTimeMutation: expect.any(Object),
            clearWrapUpTime: expect.any(Function),
        })
    })

    it('should handle wrap-up time started event', () => {
        const { result } = renderHook(() => useWrapUpTime())

        const registeredEvent =
            // @ts-ignore
            socketManager.registerReceivedEvents.mock.calls[0][0][0]
        const onReceiveHandler = registeredEvent.onReceive

        const expirationTime = '2023-01-01T12:05:00Z'
        const mockEventData = {
            event: {
                expiration_datetime: expirationTime,
            },
            voice_call: mockVoiceCall,
        }

        act(() => {
            onReceiveHandler(mockEventData)
        })

        expect(result.current.isWrappingUp).toBe(true)
        expect(result.current.voiceCall).toEqual(mockVoiceCall)
    })

    it('should update time left using useInterval', () => {
        let intervalCallback: () => void

        useIntervalMock.mockImplementation((callback) => {
            intervalCallback = callback
        })

        const { result } = renderHook(() => useWrapUpTime())

        const registeredEvent =
            // @ts-ignore
            socketManager.registerReceivedEvents.mock.calls[0][0][0]
        const onReceiveHandler = registeredEvent.onReceive

        const expirationTime = '2023-01-01T12:08:00Z'
        const mockEventData = {
            event: {
                expiration_datetime: expirationTime,
            },
            voice_call: mockVoiceCall,
        }

        act(() => {
            onReceiveHandler(mockEventData)
        })

        act(() => {
            intervalCallback!()
        })

        expect(result.current.timeLeft).toBe('03:00')
    })

    it('should clear wrap-up time when time expires', async () => {
        let intervalCallback: () => void

        useIntervalMock.mockImplementation((callback) => {
            intervalCallback = callback
        })

        const { result } = renderHook(() => useWrapUpTime())

        const registeredEvent =
            // @ts-ignore
            socketManager.registerReceivedEvents.mock.calls[0][0][0]
        const onReceiveHandler = registeredEvent.onReceive

        const expirationTime = '2023-01-01T12:05:00Z'
        const mockEventData = {
            event: {
                expiration_datetime: expirationTime,
            },
            voice_call: mockVoiceCall,
        }

        act(() => {
            onReceiveHandler(mockEventData)
        })

        jest.spyOn(Date, 'now').mockImplementation(() =>
            new Date('2023-01-01T12:06:00Z').getTime(),
        )

        act(() => {
            intervalCallback!()
        })

        expect(result.current.isWrappingUp).toBe(false)
        expect(result.current.timeLeft).toBe(null)
        expect(result.current.voiceCall).toBe(null)
    })

    it('should clear wrap-up time on successful endWrapUpTimeMutation', async () => {
        const { result } = renderHook(() => useWrapUpTime())

        const registeredEvent =
            // @ts-ignore
            socketManager.registerReceivedEvents.mock.calls[0][0][0]
        const onReceiveHandler = registeredEvent.onReceive

        act(() => {
            onReceiveHandler({
                event: {
                    expiration_datetime: '2023-01-01T12:05:00Z',
                },
                voice_call: mockVoiceCall,
            })
        })

        expect(result.current.isWrappingUp).toBe(true)
        expect(result.current.voiceCall).toEqual(mockVoiceCall)

        act(() => {
            result.current.endWrapUpTimeMutation.mutate({
                data: {
                    call_sid: 'some_id',
                },
            })
        })

        await waitFor(() => {
            expect(result.current.isWrappingUp).toBe(false)
            expect(result.current.timeLeft).toBe(null)
            expect(result.current.voiceCall).toBe(null)
        })
    })

    it('should show an error notification on endWrapUpTimeMutation error', async () => {
        server.use(
            mockEndWrapUpTimeHandler(async () =>
                HttpResponse.json({ error: 'error' } as never, {
                    status: 500,
                }),
            ).handler,
        )

        const { result } = renderHook(() => useWrapUpTime())

        act(() => {
            result.current.endWrapUpTimeMutation.mutate({
                data: {
                    call_sid: 'some_id',
                },
            })
        })

        const toastEl = await screen.findByRole('status', {
            name: 'Failed to end wrap-up time',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })

    it('should initialize the wrap up state on mount', async () => {
        server.use(
            mockGetAgentWrapUpCallStatusHandler(async () =>
                HttpResponse.json(
                    mockGetAgentWrapUpCallStatusResponse({
                        agent_id: 1,
                        call_id: 123,
                        call_sid: 'test-call-sid',
                        created_datetime: '2023-01-01T12:00:00Z',
                        expiration_datetime: '2023-01-01T12:05:00Z',
                        integration_id: 1,
                        is_wrapping_up: true,
                        status: 'wrapping-up',
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(() => useWrapUpTime())

        await waitFor(() => {
            expect(result.current.isWrappingUp).toBe(true)
            expect(result.current.voiceCall).toEqual({
                id: 123,
                integration_id: 1,
                external_id: 'test-call-sid',
            })
        })
    })

    describe('call interaction', () => {
        it('should clear wrap up state when a new call starts', () => {
            const mockCall = { sid: 'CA123' } as any

            const { result, rerender } = renderHook(() => useWrapUpTime())

            const registeredEvent =
                // @ts-ignore
                socketManager.registerReceivedEvents.mock.calls[0][0][0]
            const onReceiveHandler = registeredEvent.onReceive

            // Set wrap up state
            act(() => {
                onReceiveHandler({
                    event: {
                        expiration_datetime: '2023-01-01T12:08:00Z',
                    },
                    voice_call: mockVoiceCall,
                })
            })

            expect(result.current.isWrappingUp).toBe(true)
            expect(result.current.voiceCall).toEqual(mockVoiceCall)

            // Mock a new call starting
            useVoiceDeviceMock.mockReturnValue({
                call: mockCall,
                device: null,
                actions: {},
            } as any)

            rerender()

            // Wrap up should be cleared
            expect(result.current.isWrappingUp).toBe(false)
            expect(result.current.timeLeft).toBe(null)
            expect(result.current.voiceCall).toBe(null)
        })

        it('should not clear wrap up state if no call is active', () => {
            const { result } = renderHook(() => useWrapUpTime())

            const registeredEvent =
                // @ts-ignore
                socketManager.registerReceivedEvents.mock.calls[0][0][0]
            const onReceiveHandler = registeredEvent.onReceive

            // Set wrap up state
            act(() => {
                onReceiveHandler({
                    event: {
                        expiration_datetime: '2023-01-01T12:08:00Z',
                    },
                    voice_call: mockVoiceCall,
                })
            })

            expect(result.current.isWrappingUp).toBe(true)

            // Ensure call remains null (no call starting)
            useVoiceDeviceMock.mockReturnValue({
                call: null,
                device: null,
                actions: {},
            } as any)

            // Wrap up should remain active
            expect(result.current.isWrappingUp).toBe(true)
            expect(result.current.voiceCall).toEqual(mockVoiceCall)
        })

        it('should not affect state if wrap up is not active', () => {
            const mockCall = { sid: 'CA123' } as any

            const { result, rerender } = renderHook(() => useWrapUpTime())

            // No wrap up active initially
            expect(result.current.isWrappingUp).toBe(false)

            // Mock a call starting
            useVoiceDeviceMock.mockReturnValue({
                call: mockCall,
                device: null,
                actions: {},
            } as any)

            rerender()

            // State should remain unchanged (no wrap up to clear)
            expect(result.current.isWrappingUp).toBe(false)
            expect(result.current.timeLeft).toBe(null)
            expect(result.current.voiceCall).toBe(null)
        })
    })
})
