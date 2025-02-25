import { Call } from '@twilio/voice-sdk'

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
        })
    })

    it('should return parameters for an incoming call transferred from agent', () => {
        const call = mockIncomingCall(1, 2) as Call
        call.customParameters.set('transfer.from', '3')
        const parameters = useConnectionParameters(call)

        expect(parameters.transferFromAgentId).toEqual(3)
    })
})
