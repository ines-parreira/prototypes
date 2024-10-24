import {voiceCall} from 'fixtures/voiceCalls'

import {isVoiceCall, isOutboundVoiceCall} from '../types'

describe('type guards', () => {
    describe('isVoiceCall', () => {
        it('should return true if the object is a VoiceCall', () => {
            expect(isVoiceCall(voiceCall)).toBe(true)
        })
        it('should return false if the object is not a VoiceCall', () => {
            expect(isVoiceCall({id: 1})).toBe(false)
        })
    })

    describe('isOutboundVoiceCall', () => {
        it('should return true if the object is an outbound VoiceCall', () => {
            expect(
                isOutboundVoiceCall({
                    ...voiceCall,
                    initiated_by_agent_id: 1,
                })
            ).toBe(true)
        })

        it('should return false if the object is not an outbound VoiceCall', () => {
            expect(
                isOutboundVoiceCall({
                    ...voiceCall,
                    initiated_by_agent_id: null,
                })
            ).toBe(false)
            expect(
                isOutboundVoiceCall({
                    ...voiceCall,
                    initiated_by_agent_id: undefined,
                })
            ).toBe(false)
        })
    })
})
