import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockPrepareCallMonitoringHandler } from '@gorgias/helpdesk-mocks'

import { appQueryClient } from 'api/queryClient'
import { TwilioSocketEventType } from 'business/twilio'
import useAppDispatch from 'hooks/useAppDispatch'
import { MONITORING_SWITCH_ERROR } from 'models/voiceCall/constants'
import { TwilioMessageType } from 'models/voiceCall/twilioMessageTypes'
import { MonitoringErrorCode } from 'models/voiceCall/types'

import {
    gatherCallContext,
    handleCallEvents,
    sendTwilioSocketEvent,
} from '../twilioCall.utils'
import { useMonitoringCall } from '../useMonitoringCall'
import useVoiceDevice from '../useVoiceDevice'

const server = setupServer()

jest.mock('hooks/useAppDispatch')
jest.mock('../twilioCall.utils')
jest.mock('../useVoiceDevice')

const useAppDispatchMock = assumeMock(useAppDispatch)
const useVoiceDeviceMock = assumeMock(useVoiceDevice)
const handleCallEventsMock = assumeMock(handleCallEvents)

describe('useMonitoringCall', () => {
    const dispatchMock = jest.fn()
    const deviceMock = {
        connect: jest.fn().mockResolvedValue({}),
    }
    const actionsMock = {
        setIsDialing: jest.fn(),
        setCall: jest.fn(),
    }

    const renderWithProviders = (
        ui: () => ReturnType<typeof useMonitoringCall>,
    ) => {
        return renderHook(ui, {
            wrapper: ({ children }) =>
                React.createElement(
                    QueryClientProvider,
                    { client: appQueryClient },
                    children,
                ),
        })
    }

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useVoiceDeviceMock.mockReturnValue({
            device: deviceMock as any,
            actions: actionsMock as any,
        } as any)
    })

    afterEach(() => {
        server.resetHandlers()
        appQueryClient.clear()
    })

    afterAll(() => {
        server.close()
    })

    describe('prepareMonitoringCall', () => {
        it('should handle success', async () => {
            const mockHandler = mockPrepareCallMonitoringHandler(async () =>
                HttpResponse.json({}),
            )
            server.use(mockHandler.handler)

            const { result } = renderWithProviders(() => useMonitoringCall())

            let response
            await act(async () => {
                response = await result.current.prepareMonitoringCall('CA123')
            })

            expect(response).toEqual({ readyForMonitoring: true })
        })

        it('should handle success with existing monitoring ended', async () => {
            const mockHandler = mockPrepareCallMonitoringHandler(async () =>
                HttpResponse.json({
                    has_ended_existing: true as any,
                }),
            )
            server.use(mockHandler.handler)

            const { result } = renderWithProviders(() => useMonitoringCall())

            let response
            await act(async () => {
                response = await result.current.prepareMonitoringCall(
                    'CA123',
                    true,
                )
            })

            expect(response).toEqual({ readyForMonitoring: true })
        })

        it('should handle failure when could not end existing monitoring call', async () => {
            const mockHandler = mockPrepareCallMonitoringHandler(async () =>
                HttpResponse.json({
                    has_ended_existing: false as any,
                }),
            )
            server.use(mockHandler.handler)

            const { result } = renderWithProviders(() => useMonitoringCall())

            let response
            await act(async () => {
                response = await result.current.prepareMonitoringCall(
                    'CA123',
                    true,
                )
            })

            expect(response).toEqual({
                readyForMonitoring: false,
                errorType: 'error_message',
                errorMessage: MONITORING_SWITCH_ERROR,
            })
        })

        it('should handle failure with monitoring error code provided', async () => {
            const mockHandler = mockPrepareCallMonitoringHandler(async () =>
                HttpResponse.json(
                    {
                        error: {
                            msg: 'Not allowed',
                            data: {
                                error_code: MonitoringErrorCode.NOT_ALLOWED,
                            },
                        },
                    } as any,
                    { status: 400 },
                ),
            )
            server.use(mockHandler.handler)

            const { result } = renderWithProviders(() => useMonitoringCall())

            let response
            await act(async () => {
                response = await result.current.prepareMonitoringCall('CA123')
            })

            expect(response).toEqual({
                readyForMonitoring: false,
                errorType: 'error_code',
                errorCode: MonitoringErrorCode.NOT_ALLOWED,
            })
        })

        it('should return readyForMonitoring false with isGenericError when non-GorgiasApiError occurs', async () => {
            const mockHandler = mockPrepareCallMonitoringHandler(async () =>
                HttpResponse.json({ error: 'Network error' } as any, {
                    status: 500,
                }),
            )
            server.use(mockHandler.handler)

            const { result } = renderWithProviders(() => useMonitoringCall())

            let response
            await act(async () => {
                response = await result.current.prepareMonitoringCall('CA123')
            })

            expect(response).toEqual({
                readyForMonitoring: false,
                errorType: 'error_message',
                errorMessage: expect.any(String),
            })
        })
    })

    describe('makeMonitoringCall', () => {
        it('should connect and setup call', async () => {
            const { result } = renderWithProviders(() => useMonitoringCall())
            const onMonitoringValidationFailed = jest.fn()

            await act(async () => {
                await result.current.makeMonitoringCall(
                    'CA123456',
                    789,
                    {
                        integrationId: 123,
                        customerId: 456,
                        customerPhoneNumber: '+1234567890',
                        inCallAgentId: 999,
                    },
                    onMonitoringValidationFailed,
                )
            })

            expect(deviceMock.connect).toHaveBeenCalledWith({
                params: {
                    Direction: 'outbound-dial',
                    is_monitoring: 'true',
                    main_call_sid: 'CA123456',
                    agent_id: '789',
                    original_path: window.location.pathname,
                    tab_id: window.CLIENT_ID,
                    integration_id: '123',
                    in_call_agent_id: '999',
                    customer_id: '456',
                    customer_phone_number: '+1234567890',
                },
            })

            expect(sendTwilioSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallOutgoing,
                data: gatherCallContext({} as any),
            })

            expect(handleCallEventsMock).toHaveBeenCalledWith(
                {},
                dispatchMock,
                actionsMock,
                expect.any(Function),
            )

            expect(actionsMock.setCall).toHaveBeenCalledWith({})

            expect(onMonitoringValidationFailed).not.toHaveBeenCalled()
        })

        it('should handle null extra monitoring params', async () => {
            const { result } = renderWithProviders(() => useMonitoringCall())
            const onMonitoringValidationFailed = jest.fn()

            await act(async () => {
                await result.current.makeMonitoringCall(
                    'CA123456',
                    789,
                    {
                        integrationId: null,
                        customerId: null,
                        customerPhoneNumber: '+1234567890',
                        inCallAgentId: null,
                    },
                    onMonitoringValidationFailed,
                )
            })

            expect(deviceMock.connect).toHaveBeenCalledWith({
                params: expect.objectContaining({
                    integration_id: 'null',
                    customer_id: 'null',
                    in_call_agent_id: 'null',
                    customer_phone_number: '+1234567890',
                }),
            })
        })

        it('should call onMonitoringValidationFailed callback when validation fails', async () => {
            const onMonitoringValidationFailed = jest.fn()
            const { result } = renderWithProviders(() => useMonitoringCall())

            await act(async () => {
                await result.current.makeMonitoringCall(
                    'CA123456',
                    789,
                    {
                        integrationId: 123,
                        customerId: 456,
                        customerPhoneNumber: '+1234567890',
                        inCallAgentId: 999,
                    },
                    onMonitoringValidationFailed,
                )
            })

            const messageCallback = handleCallEventsMock.mock.calls[0][3]

            act(() => {
                messageCallback?.({
                    type: TwilioMessageType.MonitoringValidationFailed,
                    data: {
                        error_code: MonitoringErrorCode.NOT_ALLOWED,
                    },
                })
            })

            expect(onMonitoringValidationFailed).toHaveBeenCalledWith(
                MonitoringErrorCode.NOT_ALLOWED,
            )
        })

        it('should not call connect if device is not available', async () => {
            useVoiceDeviceMock.mockReturnValue({
                device: null,
                actions: actionsMock,
            } as any)

            const { result } = renderWithProviders(() => useMonitoringCall())
            const onMonitoringValidationFailed = jest.fn()

            await act(async () => {
                await result.current.makeMonitoringCall(
                    'CA123456',
                    789,
                    {
                        integrationId: 123,
                        customerId: 456,
                        customerPhoneNumber: '+1234567890',
                        inCallAgentId: 999,
                    },
                    onMonitoringValidationFailed,
                )
            })

            expect(sendTwilioSocketEvent).not.toHaveBeenCalled()
            expect(handleCallEvents).not.toHaveBeenCalled()
            expect(actionsMock.setCall).not.toHaveBeenCalled()
        })

        it('should disconnect existing monitoring call before making new one in same tab', async () => {
            const existingCallMock = {
                disconnect: jest.fn(),
                customParameters: new Map([['is_monitoring', 'true']]),
            }

            useVoiceDeviceMock.mockReturnValue({
                device: deviceMock,
                call: existingCallMock,
                actions: actionsMock,
            } as any)

            const { result } = renderWithProviders(() => useMonitoringCall())
            const onMonitoringValidationFailed = jest.fn()

            await act(async () => {
                await result.current.makeMonitoringCall(
                    'CA123456',
                    789,
                    {
                        integrationId: 123,
                        customerId: 456,
                        customerPhoneNumber: '+1234567890',
                        inCallAgentId: 999,
                    },
                    onMonitoringValidationFailed,
                )
            })

            expect(existingCallMock.disconnect).toHaveBeenCalled()
            expect(deviceMock.connect).toHaveBeenCalledWith({
                params: expect.objectContaining({
                    is_monitoring: 'true',
                    main_call_sid: 'CA123456',
                }),
            })
        })
    })
})
