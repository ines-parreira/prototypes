import * as momentUtils from 'utils/date'
import {PhoneIntegrationEvent} from 'constants/integrations/types/event'
import {
    isFinalVoiceCallStatus,
    getFormattedDurationOngoingCall,
    getFormattedDurationEndedCall,
    processEvents,
} from '../utils'
import {VoiceCall, VoiceCallEvent, VoiceCallStatus} from '../types'

const getMomentSpy = jest.spyOn(momentUtils, 'getMoment')

describe('voice call utils', () => {
    describe('isFinalVoiceCallStatus', () => {
        it('should return true for final voice call statuses', () => {
            expect(isFinalVoiceCallStatus(VoiceCallStatus.Busy)).toBe(true)
            expect(isFinalVoiceCallStatus(VoiceCallStatus.Canceled)).toBe(true)
            expect(isFinalVoiceCallStatus(VoiceCallStatus.Completed)).toBe(true)
            expect(isFinalVoiceCallStatus(VoiceCallStatus.Failed)).toBe(true)
            expect(isFinalVoiceCallStatus(VoiceCallStatus.NoAnswer)).toBe(true)
            expect(isFinalVoiceCallStatus(VoiceCallStatus.Ending)).toBe(true)
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
        })
    })

    describe('getFormattedDurationEndedCall', () => {
        it('should return formatted duration for ended calls', () => {
            expect(getFormattedDurationEndedCall(10)).toBe('10s')
            expect(getFormattedDurationEndedCall(60)).toBe('1m 0s')
            expect(getFormattedDurationEndedCall(3600)).toBe('1h 0m 0s')
            expect(getFormattedDurationEndedCall(3661)).toBe('1h 1m 1s')
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

    describe('processEvents', () => {
        it('should return an empty array when passed an empty array', () => {
            const result = processEvents([])
            expect(result).toEqual([])
        })

        it('should return an array of objects with the correct text and user_id properties', () => {
            const events: VoiceCallEvent[] = [
                {type: PhoneIntegrationEvent.PhoneCallRinging, user_id: 2},
                {type: PhoneIntegrationEvent.DeclinedPhoneCall, user_id: 2},
                {type: PhoneIntegrationEvent.PhoneCallRinging, user_id: 3},
                {type: PhoneIntegrationEvent.PhoneCallRinging, user_id: 4},
                {type: PhoneIntegrationEvent.ChildCallNotAnswered, user_id: 4},
                {type: PhoneIntegrationEvent.PhoneCallRinging, user_id: 5},
                {type: PhoneIntegrationEvent.PhoneCallAnswered, user_id: 5},
            ] as VoiceCallEvent[]
            const result = processEvents(events)
            expect(result).toEqual([
                {text: 'Declined by', user_id: 2},
                {text: 'Missed by', user_id: 3},
                {text: 'Missed by', user_id: 4},
                {text: 'Answered by', user_id: 5},
            ])
        })

        it('should not include events that are not PhoneCallAnswered, DeclinedPhoneCall, PhoneCallRinging, or ChildCallNotAnswered', () => {
            const events: VoiceCallEvent[] = [
                {type: PhoneIntegrationEvent.PhoneCallAnswered, user_id: 1},
                {type: PhoneIntegrationEvent.DeclinedPhoneCall, user_id: 2},
                {type: PhoneIntegrationEvent.PhoneCallRinging, user_id: 3},
                {type: 'some other event', user_id: 4},
            ] as VoiceCallEvent[]
            const result = processEvents(events)
            expect(result).toEqual([
                {text: 'Answered by', user_id: 1},
                {text: 'Declined by', user_id: 2},
                {text: 'Missed by', user_id: 3},
            ])
        })

        it('should handle cases where there is a ChildCallNotAnswered event for missed call', () => {
            const events: VoiceCallEvent[] = [
                {type: PhoneIntegrationEvent.PhoneCallRinging, user_id: 1},
                {type: PhoneIntegrationEvent.ChildCallNotAnswered, user_id: 1},
            ] as VoiceCallEvent[]
            const result = processEvents(events)
            expect(result).toEqual([{text: 'Missed by', user_id: 1}])
        })
    })
})
