import {renderHook, act} from '@testing-library/react-hooks'
import {waitFor} from '@testing-library/react'
import useAppDispatch from 'hooks/useAppDispatch'
import {TwilioSocketEventType} from 'business/twilio'
import {assumeMock} from 'utils/testing'
import {
    gatherCallContext,
    handleCallEvents,
    sendTwilioSocketEvent,
} from 'hooks/integrations/phone/utils'
import {useOutboundCall} from '../useOutboundCall'
import useVoiceDevice from '../useVoiceDevice'
import {connectCall} from '../api'

jest.mock('hooks/useAppDispatch')
jest.mock('hooks/integrations/phone/utils')
jest.mock('../useVoiceDevice')
jest.mock('../api')

const useAppDispatchMock = assumeMock(useAppDispatch)
const useVoiceDeviceMock = assumeMock(useVoiceDevice)

describe('useOutboundCall', () => {
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
        const {result} = renderHook(() => useOutboundCall())

        const options = {
            fromAddress: 'from@example.com',
            toAddress: 'to@example.com',
            integrationId: 123,
            customerName: 'John Doe',
            ticketId: 456,
            agentId: 789,
        }

        act(() => {
            result.current(options)
        })

        expect(deviceMock.connect).toHaveBeenCalledWith({
            params: {
                Direction: 'outbound-dial',
                Caller: options.fromAddress,
                Called: options.toAddress,
                From: options.fromAddress,
                To: options.toAddress,
                integration_id: options.integrationId.toString(),
                customer_name: options.customerName,
                agent_id: options.agentId.toString(),
                original_path: window.location.pathname,
                tab_id: window.CLIENT_ID,
                original_ticket_id: options.ticketId.toString(),
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
            actionsMock
        )

        expect(actionsMock.setIsDialing).toHaveBeenCalledWith(true)
        expect(actionsMock.setCall).toHaveBeenCalledWith({})

        expect(connectCall).toHaveBeenCalled()
    })

    it('should not call connect if device is not available', () => {
        useVoiceDeviceMock.mockReturnValue({
            device: null,
            actions: actionsMock,
        } as any)

        const {result} = renderHook(() => useOutboundCall())

        const options = {
            fromAddress: 'from@example.com',
            toAddress: 'to@example.com',
            integrationId: 123,
            customerName: 'John Doe',
            ticketId: 456,
            agentId: 789,
        }

        act(() => {
            result.current(options)
        })

        expect(deviceMock.connect).not.toHaveBeenCalled()
        expect(sendTwilioSocketEvent).not.toHaveBeenCalled()
        expect(handleCallEvents).not.toHaveBeenCalled()
        expect(actionsMock.setIsDialing).not.toHaveBeenCalled()
        expect(actionsMock.setCall).not.toHaveBeenCalled()
        expect(connectCall).not.toHaveBeenCalled()
    })
})
