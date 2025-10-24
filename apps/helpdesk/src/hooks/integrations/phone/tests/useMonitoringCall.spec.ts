import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { TwilioSocketEventType } from 'business/twilio'
import useAppDispatch from 'hooks/useAppDispatch'

import {
    gatherCallContext,
    handleCallEvents,
    sendTwilioSocketEvent,
} from '../twilioCall.utils'
import { useMonitoringCall } from '../useMonitoringCall'
import useVoiceDevice from '../useVoiceDevice'

jest.mock('hooks/useAppDispatch')
jest.mock('../twilioCall.utils')
jest.mock('../useVoiceDevice')

const useAppDispatchMock = assumeMock(useAppDispatch)
const useVoiceDeviceMock = assumeMock(useVoiceDevice)

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

    it('should call the necessary functions with the correct parameters', async () => {
        const { result } = renderHook(() => useMonitoringCall())

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

        expect(handleCallEvents).toHaveBeenCalledWith(
            {},
            dispatchMock,
            actionsMock,
        )

        expect(actionsMock.setCall).toHaveBeenCalledWith({})
    })

    it('should not call connect if device is not available', async () => {
        useVoiceDeviceMock.mockReturnValue({
            device: null,
            actions: actionsMock,
        } as any)

        const { result } = renderHook(() => useMonitoringCall())

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
