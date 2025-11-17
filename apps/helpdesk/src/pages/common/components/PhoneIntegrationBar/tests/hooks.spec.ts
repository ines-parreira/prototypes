import type { Call } from '@twilio/voice-sdk'

import {
    mockIncomingCall,
    mockOutgoingCall,
} from '../../../../../tests/twilioMocks'
import { useConnectionParameters } from '../hooks'

describe('useConnectionParameters()', () => {
    it('should return parameters for an incoming call', () => {
        const call = mockIncomingCall() as Call
        const parameters = useConnectionParameters(call)

        expect(parameters).toEqual({
            customerName: 'Bob',
            customerPhoneNumber: '+25111111111',
            integrationId: 1,
            ticketId: 2,
            transferFromAgentId: null,
            isTransferring: false,
        })
    })

    it('should return parameters for an outgoing call', () => {
        const call = mockOutgoingCall() as Call
        const parameters = useConnectionParameters(call)

        expect(parameters).toEqual({
            customerName: 'Bob',
            customerPhoneNumber: '+14158880101',
            integrationId: 1,
            ticketId: null,
            transferFromAgentId: null,
            isTransferring: false,
        })
    })

    it('should return parameters for an incoming call transferred from agent', () => {
        const call = mockIncomingCall(1, 2) as Call
        call.customParameters.set('transfer.from', '3')
        const parameters = useConnectionParameters(call)

        expect(parameters.transferFromAgentId).toEqual(3)
        expect(parameters.isTransferring).toEqual(false)
    })

    it.each([
        { customParameterValue: 'True', isTransferring: true },
        { customParameterValue: 'False', isTransferring: false },
        { customParameterValue: '', isTransferring: false },
    ])(
        'should detect transfer when transfer parameter is present',
        ({ customParameterValue, isTransferring }) => {
            const call = mockIncomingCall(1, 2) as Call
            call.customParameters.set('transfer', customParameterValue)
            const parameters = useConnectionParameters(call)

            expect(parameters.isTransferring).toEqual(isTransferring)
        },
    )
})
