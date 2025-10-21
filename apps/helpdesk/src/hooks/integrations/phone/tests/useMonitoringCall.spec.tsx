import { assumeMock, renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import { VoiceCallDirection } from '@gorgias/helpdesk-types'

import { PhoneCallDirection, TwilioSocketEventType } from 'business/twilio'
import {
    gatherCallContext,
    handleCallEvents,
    sendTwilioSocketEvent,
} from 'hooks/integrations/phone/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import { VoiceCall } from 'models/voiceCall/types'

import { useMonitoringCall } from '../useMonitoringCall'
import useVoiceDevice from '../useVoiceDevice'

jest.mock('hooks/useAppDispatch')
jest.mock('hooks/integrations/phone/utils')
jest.mock('../useVoiceDevice')

const useAppDispatchMock = assumeMock(useAppDispatch)
const useVoiceDeviceMock = assumeMock(useVoiceDevice)

describe('useMonitoringCall', () => {
    const dispatchMock = jest.fn()
    const deviceMock = {
        connect: jest.fn().mockResolvedValue({}),
    }
    const actionsMock = {
        setCall: jest.fn(),
    }

    describe('makeMonitoringCall', () => {
        const mainInboundVoiceCall = {
            external_id: 'main-call-sid-123',
            direction: VoiceCallDirection.Inbound,
            integration_id: 1,
            last_answered_by_agent_id: 789,
            customer_id: 42,
            phone_number_source: '+1234567890',
        } as VoiceCall
        const mainOutboundVoiceCall = {
            external_id: 'main-call-sid-123',
            direction: VoiceCallDirection.Outbound,
            integration_id: 1,
            initiated_by_agent_id: 987,
            customer_id: 42,
            phone_number_destination: '+1234567890',
        } as VoiceCall

        beforeEach(() => {
            useAppDispatchMock.mockReturnValue(dispatchMock)
            useVoiceDeviceMock.mockReturnValue({
                device: deviceMock,
                actions: actionsMock,
            } as any)
        })

        it.each([
            {
                description: 'inbound call',
                mainCall: mainInboundVoiceCall,
                customParams: {
                    integration_id: '1',
                    in_call_agent_id: '789',
                    customer_id: '42',
                    customer_phone_number: '+1234567890',
                },
            },
            {
                description: 'outbound call',
                mainCall: mainOutboundVoiceCall,
                customParams: {
                    integration_id: '1',
                    in_call_agent_id: '987',
                    customer_id: '42',
                    customer_phone_number: '+1234567890',
                },
            },
            {
                description: 'outbound call after transfer',
                mainCall: {
                    ...mainOutboundVoiceCall,
                    last_answered_by_agent_id: 999,
                },
                customParams: {
                    integration_id: '1',
                    in_call_agent_id: '999',
                    customer_id: '42',
                    customer_phone_number: '+1234567890',
                },
            },
        ])(
            'should correctly initiate a monitoring call for $description',
            async ({ mainCall, customParams }) => {
                const {
                    result: {
                        current: { makeMonitoringCall },
                    },
                } = renderHook(() => useMonitoringCall())

                act(() => {
                    makeMonitoringCall(mainCall, 456)
                })

                expect(deviceMock.connect).toHaveBeenCalledWith({
                    params: {
                        Direction: PhoneCallDirection.OutboundDial,
                        is_monitoring: 'true',
                        main_call_sid: 'main-call-sid-123',
                        agent_id: '456',
                        original_path: window.location.pathname,
                        tab_id: window.CLIENT_ID,
                        ...customParams,
                    },
                })

                await waitFor(() => {
                    expect(sendTwilioSocketEvent).toHaveBeenCalledWith({
                        type: TwilioSocketEventType.CallOutgoing,
                        data: gatherCallContext({} as any),
                    })
                })

                expect(handleCallEvents).toHaveBeenCalledWith(
                    {},
                    dispatchMock,
                    actionsMock,
                )

                expect(actionsMock.setCall).toHaveBeenCalledWith({})
            },
        )

        it('should not initiate call if device is not available', () => {
            useVoiceDeviceMock.mockReturnValue({
                device: null,
                actions: actionsMock,
            } as any)

            const {
                result: {
                    current: { makeMonitoringCall },
                },
            } = renderHook(() => useMonitoringCall())

            act(() => {
                makeMonitoringCall(mainInboundVoiceCall, 456)
            })

            expect(deviceMock.connect).not.toHaveBeenCalled()
            expect(sendTwilioSocketEvent).not.toHaveBeenCalled()
            expect(handleCallEvents).not.toHaveBeenCalled()
            expect(actionsMock.setCall).not.toHaveBeenCalled()
        })
    })
})
