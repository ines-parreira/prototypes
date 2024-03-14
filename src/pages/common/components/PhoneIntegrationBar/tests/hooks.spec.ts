import {Call} from '@twilio/voice-sdk'

import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    mockIncomingCall,
    mockOutgoingCall,
} from '../../../../../tests/twilioMocks'
import {useConnectionParameters} from '../hooks'

describe('useConnectionParameters()', () => {
    beforeEach(() => {
        mockFlags({})
    })

    afterEach(resetLDMocks)

    it('should return parameters for an incoming call', () => {
        mockFlags({[FeatureFlagKey.VoiceConferenceInboundRoundRobin]: true})
        const call = mockIncomingCall() as Call
        const parameters = useConnectionParameters(call)

        expect(parameters).toEqual({
            customerName: 'Bob',
            customerPhoneNumber: '+25111111111',
            integrationId: 1,
            ticketId: 2,
        })
    })

    it('should return correct customer phone number when conference FF is disabled', () => {
        mockFlags({[FeatureFlagKey.VoiceConferenceInboundRoundRobin]: false})
        const call = mockIncomingCall() as Call
        const parameters = useConnectionParameters(call)

        expect(parameters.customerPhoneNumber).toEqual('+14158880101')
    })

    it('should return parameters for an outgoing call', () => {
        const call = mockOutgoingCall() as Call
        const parameters = useConnectionParameters(call)

        expect(parameters).toEqual({
            customerName: 'Bob',
            customerPhoneNumber: '+14158880101',
            integrationId: 1,
            ticketId: null,
        })
    })
})
