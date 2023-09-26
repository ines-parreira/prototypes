import {voiceCall} from 'fixtures/voiceCalls'
import {isVoiceCall} from '../types'

describe('type guards', () => {
    describe('isVoiceCall', () => {
        it('should return true if the object is a VoiceCall', () => {
            expect(isVoiceCall(voiceCall)).toBe(true)
        })
        it('should return false if the object is not a VoiceCall', () => {
            expect(isVoiceCall({id: 1})).toBe(false)
        })
    })
})
