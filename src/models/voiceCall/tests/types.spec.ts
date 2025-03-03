import { voiceCall } from 'fixtures/voiceCalls'

import {
    getPrettyVoiceCallDisplayStatusName,
    isOutboundVoiceCall,
    isVoiceCall,
    VoiceCallDisplayStatus,
} from '../types'

describe('type guards', () => {
    describe('isVoiceCall', () => {
        it('should return true if the object is a VoiceCall', () => {
            expect(isVoiceCall(voiceCall)).toBe(true)
        })
        it('should return false if the object is not a VoiceCall', () => {
            expect(isVoiceCall({ id: 1 })).toBe(false)
        })
    })

    describe('isOutboundVoiceCall', () => {
        it('should return true if the object is an outbound VoiceCall', () => {
            expect(
                isOutboundVoiceCall({
                    ...voiceCall,
                    initiated_by_agent_id: 1,
                }),
            ).toBe(true)
        })

        it('should return false if the object is not an outbound VoiceCall', () => {
            expect(
                isOutboundVoiceCall({
                    ...voiceCall,
                    initiated_by_agent_id: null,
                }),
            ).toBe(false)
            expect(
                isOutboundVoiceCall({
                    ...voiceCall,
                    initiated_by_agent_id: undefined,
                }),
            ).toBe(false)
        })
    })
})

describe('getPrettyVoiceCallDisplayStatusName', () => {
    it.each([
        [VoiceCallDisplayStatus.Ringing, 'Ringing'],
        [VoiceCallDisplayStatus.InProgress, 'In Progress'],
        [VoiceCallDisplayStatus.Answered, 'Answered'],
        [VoiceCallDisplayStatus.Missed, 'Missed'],
        [VoiceCallDisplayStatus.Abandoned, 'Abandoned'],
        [VoiceCallDisplayStatus.Cancelled, 'Cancelled'],
        [VoiceCallDisplayStatus.Failed, 'Failed'],
        [VoiceCallDisplayStatus.Unanswered, 'Unanswered'],
    ])(
        'should return the correct display name for each status',
        (displayStatus, prettyName) => {
            expect(getPrettyVoiceCallDisplayStatusName(displayStatus)).toBe(
                prettyName,
            )
        },
    )
})
