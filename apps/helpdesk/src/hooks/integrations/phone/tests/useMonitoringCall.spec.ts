import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { VoiceCallDirection } from '@gorgias/helpdesk-types'

import { TwilioSocketEventType } from 'business/twilio'
import useAppDispatch from 'hooks/useAppDispatch'
import { MONITORING_RESTRICTION_REASONS } from 'models/voiceCall/constants'
import { TwilioMessageType } from 'models/voiceCall/twilioMessageTypes'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import {
    gatherCallContext,
    handleCallEvents,
    sendTwilioSocketEvent,
} from '../twilioCall.utils'
import { useMonitoringCall } from '../useMonitoringCall'
import useVoiceDevice from '../useVoiceDevice'

jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')
jest.mock('../twilioCall.utils')
jest.mock('../useVoiceDevice')

const useAppDispatchMock = assumeMock(useAppDispatch)
const notifyMock = assumeMock(notify)
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

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useVoiceDeviceMock.mockReturnValue({
            device: deviceMock as any,
            actions: actionsMock as any,
        } as any)
    })

    it.each([VoiceCallDirection.Inbound, VoiceCallDirection.Outbound])(
        'should call the necessary functions with the correct parameters',
        async (voiceCallDirection: VoiceCallDirection) => {
            const { result } = renderHook(() =>
                useMonitoringCall(voiceCallDirection),
            )

            await act(async () => {
                await result.current.makeMonitoringCall('CA123456', 789, {
                    integrationId: 123,
                    customerId: 456,
                    customerPhoneNumber: '+1234567890',
                    inCallAgentId: 999,
                })
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
            const messageReceivedCallback =
                handleCallEventsMock.mock.calls[0][3]
            messageReceivedCallback?.({
                type: TwilioMessageType.MonitoringValidationFailed,
                data: { error_code: 'VALIDATION_ERROR' },
            })
            expect(dispatchMock).toHaveBeenCalled()
            expect(notifyMock).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message: MONITORING_RESTRICTION_REASONS.GENERIC,
            })

            expect(actionsMock.setCall).toHaveBeenCalledWith({})
        },
    )

    it('should not call connect if device is not available', async () => {
        useVoiceDeviceMock.mockReturnValue({
            device: null,
            actions: actionsMock,
        } as any)

        const { result } = renderHook(() =>
            useMonitoringCall(VoiceCallDirection.Inbound),
        )

        await act(async () => {
            await result.current.makeMonitoringCall('CA123456', 789, {
                integrationId: 123,
                customerId: 456,
                customerPhoneNumber: '+1234567890',
                inCallAgentId: 999,
            })
        })

        expect(sendTwilioSocketEvent).not.toHaveBeenCalled()
        expect(handleCallEvents).not.toHaveBeenCalled()
        expect(actionsMock.setCall).not.toHaveBeenCalled()
    })
})
