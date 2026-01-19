import { useInterval } from '@repo/hooks'
import { assumeMock } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import {
    endWrapUpTime,
    getAgentWrapUpCallStatus,
} from '@gorgias/helpdesk-client'

import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import { useNotify } from 'hooks/useNotify'
import type { VoiceCall } from 'models/voiceCall/types'
import socketManager from 'services/socketManager'
import { SocketEventType } from 'services/socketManager/types'
import { renderHookWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import useWrapUpTime from '../useWrapUpTime'

jest.mock('@gorgias/helpdesk-client')
jest.mock('hooks/useNotify')
jest.mock('hooks/integrations/phone/useVoiceDevice')
jest.mock('services/socketManager', () => ({
    registerReceivedEvents: jest.fn(),
    unregisterReceivedEvents: jest.fn(),
}))
jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
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

const endWrapUpTimeMock = assumeMock(endWrapUpTime)
const getAgentWrapUpCallStatusMock = assumeMock(getAgentWrapUpCallStatus)
const useNotifyMock = assumeMock(useNotify)
const useIntervalMock = assumeMock(useInterval)
const useVoiceDeviceMock = assumeMock(useVoiceDevice)

describe('useWrapUpTime', () => {
    const mockVoiceCall: Partial<VoiceCall> = {
        integration_id: 123,
        external_id: 'test-call-sid',
    }

    const mockErrorNotify = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        useNotifyMock.mockReturnValue({
            error: mockErrorNotify,
        } as any)

        useVoiceDeviceMock.mockReturnValue({
            call: null,
            device: null,
            actions: {},
        } as any)

        endWrapUpTimeMock.mockResolvedValue({
            data: {},
        } as any)
    })

    it('should register socket event on mount', () => {
        renderHookWithQueryClientProvider(() => useWrapUpTime())

        expect(socketManager.registerReceivedEvents).toHaveBeenCalledWith([
            {
                name: SocketEventType.VoiceCallWrapUpTimeStarted,
                onReceive: expect.any(Function),
            },
        ])
    })

    it('should unregister socket event on unmount', () => {
        const { unmount } = renderHookWithQueryClientProvider(() =>
            useWrapUpTime(),
        )
        unmount()

        expect(socketManager.unregisterReceivedEvents).toHaveBeenCalledWith([
            {
                name: SocketEventType.VoiceCallWrapUpTimeStarted,
                onReceive: expect.any(Function),
            },
        ])
    })

    it('should return default values when no wrap-up is in progress', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useWrapUpTime(),
        )

        expect(result.current).toEqual({
            isWrappingUp: false,
            timeLeft: null,
            voiceCall: null,
            endWrapUpTimeMutation: expect.any(Object),
            clearWrapUpTime: expect.any(Function),
        })
    })

    it('should handle wrap-up time started event', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useWrapUpTime(),
        )

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

        const { result } = renderHookWithQueryClientProvider(() =>
            useWrapUpTime(),
        )

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

        const { result } = renderHookWithQueryClientProvider(() =>
            useWrapUpTime(),
        )

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
        endWrapUpTimeMock.mockResolvedValue({
            data: {},
        } as any)

        const { result } = renderHookWithQueryClientProvider(() =>
            useWrapUpTime(),
        )

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
        endWrapUpTimeMock.mockRejectedValue('error')

        const { result } = renderHookWithQueryClientProvider(() =>
            useWrapUpTime(),
        )

        act(() => {
            result.current.endWrapUpTimeMutation.mutate({
                data: {
                    call_sid: 'some_id',
                },
            })
        })

        await waitFor(() => {
            expect(mockErrorNotify).toHaveBeenCalledWith(
                'Failed to end wrap-up time',
            )
        })
    })

    it('should initialize the wrap up state on mount', async () => {
        getAgentWrapUpCallStatusMock.mockResolvedValue({
            data: {
                status: 'wrapping-up',
                expiration_datetime: '2023-01-01T12:05:00Z',
                call_id: '123',
                integration_id: 1,
                call_sid: 'test-call-sid',
            },
        } as any)

        const { result } = renderHookWithQueryClientProvider(() =>
            useWrapUpTime(),
        )

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

            const { result, rerender } = renderHookWithQueryClientProvider(() =>
                useWrapUpTime(),
            )

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
            const { result } = renderHookWithQueryClientProvider(() =>
                useWrapUpTime(),
            )

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

            const { result, rerender } = renderHookWithQueryClientProvider(() =>
                useWrapUpTime(),
            )

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
