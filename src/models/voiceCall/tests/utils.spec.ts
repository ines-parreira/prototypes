import {isFinalVoiceCallStatus} from '../utils'
import {VoiceCallStatus} from '../types'

describe('isFinalVoiceCallStatus', () => {
    it('should return true for final voice call statuses', () => {
        expect(isFinalVoiceCallStatus(VoiceCallStatus.Busy)).toBe(true)
        expect(isFinalVoiceCallStatus(VoiceCallStatus.Canceled)).toBe(true)
        expect(isFinalVoiceCallStatus(VoiceCallStatus.Completed)).toBe(true)
        expect(isFinalVoiceCallStatus(VoiceCallStatus.Failed)).toBe(true)
        expect(isFinalVoiceCallStatus(VoiceCallStatus.NoAnswer)).toBe(true)
    })

    it('should return false for non-final voice call statuses', () => {
        expect(isFinalVoiceCallStatus(VoiceCallStatus.Answered)).toBe(false)
        expect(isFinalVoiceCallStatus(VoiceCallStatus.Connected)).toBe(false)
        expect(isFinalVoiceCallStatus(VoiceCallStatus.InProgress)).toBe(false)
        expect(isFinalVoiceCallStatus(VoiceCallStatus.Initiated)).toBe(false)
        expect(isFinalVoiceCallStatus(VoiceCallStatus.Queued)).toBe(false)
        expect(isFinalVoiceCallStatus(VoiceCallStatus.Ringing)).toBe(false)
        expect(isFinalVoiceCallStatus(VoiceCallStatus.Ending)).toBe(false)
    })
})
