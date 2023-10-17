import * as momentUtils from 'utils/date'
import {
    isFinalVoiceCallStatus,
    getFormattedDurationOngoingCall,
    getFormattedDurationEndedCall,
} from '../utils'
import {VoiceCall, VoiceCallStatus} from '../types'

const getMomentSpy = jest.spyOn(momentUtils, 'getMoment')

describe('voice call utils', () => {
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
            expect(isFinalVoiceCallStatus(VoiceCallStatus.Connected)).toBe(
                false
            )
            expect(isFinalVoiceCallStatus(VoiceCallStatus.InProgress)).toBe(
                false
            )
            expect(isFinalVoiceCallStatus(VoiceCallStatus.Initiated)).toBe(
                false
            )
            expect(isFinalVoiceCallStatus(VoiceCallStatus.Queued)).toBe(false)
            expect(isFinalVoiceCallStatus(VoiceCallStatus.Ringing)).toBe(false)
            expect(isFinalVoiceCallStatus(VoiceCallStatus.Ending)).toBe(false)
        })
    })

    describe('getFormattedDurationEndedCall', () => {
        it('should return formatted duration for ended calls', () => {
            expect(getFormattedDurationEndedCall(10)).toBe('10S')
            expect(getFormattedDurationEndedCall(60)).toBe('1M 0S')
            expect(getFormattedDurationEndedCall(3600)).toBe('1H 0M 0S')
            expect(getFormattedDurationEndedCall(3661)).toBe('1H 1M 1S')
        })
    })

    describe('getFormattedDurationOngoingCall', () => {
        it('should return formatted duration for ongoing calls', () => {
            getMomentSpy.mockReturnValue(
                momentUtils.stringToDatetime('2023-01-01 10:10:10') as any
            )
            expect(
                getFormattedDurationOngoingCall({
                    started_datetime: '2023-01-01 10:10:10',
                } as VoiceCall)
            ).toBe('00:00')
            expect(
                getFormattedDurationOngoingCall({
                    started_datetime: '2023-01-01 10:10:09',
                } as VoiceCall)
            ).toBe('00:01')
            expect(
                getFormattedDurationOngoingCall({
                    started_datetime: '2023-01-01 10:09:10',
                } as VoiceCall)
            ).toBe('01:00')
            expect(
                getFormattedDurationOngoingCall({
                    started_datetime: '2023-01-01 09:10:10',
                } as VoiceCall)
            ).toBe('01:00:00')
            expect(
                getFormattedDurationOngoingCall({
                    started_datetime: '2023-01-01 09:09:09',
                } as VoiceCall)
            ).toBe('01:01:01')
        })
    })
})
