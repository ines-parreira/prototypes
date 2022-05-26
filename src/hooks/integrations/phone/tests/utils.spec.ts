import {fromJS} from 'immutable'
import {Call} from '@twilio/voice-sdk'

import {generateCallId, getCallSid} from '../utils'

describe('generateCallId', () => {
    it('should generate an ID from an incoming call', () => {
        const call = {
            direction: Call.CallDirection.Incoming,
            parameters: {
                From: '+123',
            },
            customParameters: fromJS({
                to: '+456',
            }),
        } as unknown as Call

        expect(generateCallId(call)).toEqual(
            '4ae6fde649ec113bf070d2cdd44dc622fb9e94bb595da893416c9e8ad378ab33'
        )
    })

    it('should generate an ID from an outgoing call', () => {
        const call = {
            direction: Call.CallDirection.Outgoing,
            customParameters: fromJS({
                From: '+123',
                To: '+456',
            }),
        } as unknown as Call

        expect(generateCallId(call)).toEqual(
            '4ae6fde649ec113bf070d2cdd44dc622fb9e94bb595da893416c9e8ad378ab33'
        )
    })
})

describe('getCallSid', () => {
    it('should get the CallSid from an incoming call', () => {
        const call = {
            direction: Call.CallDirection.Incoming,
            customParameters: fromJS({
                call_sid: 'CA123',
            }),
        } as unknown as Call

        expect(getCallSid(call)).toEqual('CA123')
    })

    it('should get the CallSid from an outgoing call', () => {
        const call = {
            direction: Call.CallDirection.Outgoing,
            parameters: {
                CallSid: 'CA123',
            },
        } as unknown as Call

        expect(getCallSid(call)).toEqual('CA123')
    })
})
