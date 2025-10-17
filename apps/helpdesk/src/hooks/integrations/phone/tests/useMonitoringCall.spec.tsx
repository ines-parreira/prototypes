import { assumeMock, renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import { PhoneCallDirection, TwilioSocketEventType } from 'business/twilio'
import {
    gatherCallContext,
    handleCallEvents,
    sendTwilioSocketEvent,
} from 'hooks/integrations/phone/utils'
import useAppDispatch from 'hooks/useAppDispatch'

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

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useVoiceDeviceMock.mockReturnValue({
            device: deviceMock as any,
            actions: actionsMock as any,
        } as any)
    })

    it('should correctly initiate a monitoring call', async () => {
        const { result } = renderHook(() => useMonitoringCall())

        const options = {
            mainCallSid: 'main-call-sid-123',
            agentId: 456,
        }

        act(() => {
            result.current(options)
        })

        expect(deviceMock.connect).toHaveBeenCalledWith({
            params: {
                Direction: PhoneCallDirection.OutboundDial,
                is_monitoring: 'true',
                main_call_sid: options.mainCallSid,
                agent_id: options.agentId.toString(),
                original_path: window.location.pathname,
                tab_id: window.CLIENT_ID,
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
    })

    it('should not initiate call if device is not available', () => {
        useVoiceDeviceMock.mockReturnValue({
            device: null,
            actions: actionsMock,
        } as any)

        const { result } = renderHook(() => useMonitoringCall())

        const options = {
            mainCallSid: 'main-call-sid-123',
            agentId: 456,
        }

        act(() => {
            result.current(options)
        })

        expect(deviceMock.connect).not.toHaveBeenCalled()
        expect(sendTwilioSocketEvent).not.toHaveBeenCalled()
        expect(handleCallEvents).not.toHaveBeenCalled()
        expect(actionsMock.setCall).not.toHaveBeenCalled()
    })
})
