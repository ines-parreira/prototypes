import {Call} from '@twilio/voice-sdk'

import {
    mockIncomingCall,
    mockOutgoingCall,
} from '../../../../../tests/twilioMocks'
import {useConnectionParameters} from '../hooks'

describe('useConnectionParameters()', () => {
    it('should return parameters for an incoming call', () => {
        const call = mockIncomingCall() as Call
        const parameters = useConnectionParameters(call)

        expect(parameters).toMatchSnapshot()
    })

    it('should return parameters for an outgoing call', () => {
        const call = mockOutgoingCall() as Call
        const parameters = useConnectionParameters(call)

        expect(parameters).toMatchSnapshot()
    })
})
