import { VoiceMessageType } from 'models/integration/constants'

import { getVoiceMessagePayload, isValueInRange } from '../utils'

describe('isValueInRange', () => {
    it('should check if a number is inside the range', () => {
        expect(isValueInRange(5, 0, 10)).toBe(true)
        expect(isValueInRange(-4, -10, 3)).toBe(true)
        expect(isValueInRange(5, 5, 15)).toBe(true)
        expect(isValueInRange(15, 5, 15)).toBe(true)
        expect(isValueInRange(0, 5, 15)).toBe(false)
        expect(isValueInRange(30, 5, 15)).toBe(false)
    })
})

describe('getVoiceMessagePayload', () => {
    it('should return the correct payload for type "None"', () => {
        const voice_message = {
            voice_message_type: VoiceMessageType.None,
        } as any
        expect(getVoiceMessagePayload(voice_message)).toEqual({
            voice_message_type: VoiceMessageType.None,
        })
    })

    describe('VoiceMessageType.TextToSpeech', () => {
        it('should return the correct payload for type "TextToSpeech" with content', () => {
            const voice_message = {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'test',
            } as any
            expect(getVoiceMessagePayload(voice_message)).toEqual({
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'test',
            })
        })

        it('should return null if the content is missing', () => {
            const voice_message = {
                voice_message_type: VoiceMessageType.TextToSpeech,
            } as any
            expect(getVoiceMessagePayload(voice_message)).toBeNull()
        })
    })

    describe('VoiceMessageType.VoiceRecording', () => {
        it('should return the correct payload when all fields are present', () => {
            const voice_message = {
                voice_message_type: VoiceMessageType.VoiceRecording,
                new_voice_recording_file: 'file',
                new_voice_recording_file_name: 'name',
                new_voice_recording_file_type: 'type',
            } as any
            expect(getVoiceMessagePayload(voice_message)).toEqual({
                voice_message_type: VoiceMessageType.VoiceRecording,
                new_voice_recording_file: 'file',
                new_voice_recording_file_name: 'name',
                new_voice_recording_file_type: 'type',
            })
        })

        it('should return the correct payload when some fields are missing', () => {
            const voice_message = {
                voice_message_type: VoiceMessageType.VoiceRecording,
                new_voice_recording_file: 'file',
            } as any
            expect(getVoiceMessagePayload(voice_message)).toEqual({
                voice_message_type: VoiceMessageType.VoiceRecording,
            })
        })
    })
})
