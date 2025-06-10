import { VoiceCallStatus } from '@gorgias/helpdesk-types'

import { PhoneIntegrationEvent } from 'constants/integrations/types/event'
import * as momentUtils from 'utils/date'

import { VoiceCall, VoiceCallEvent } from '../types'
import {
    getFormattedDurationEndedCall,
    getFormattedDurationOngoingCall,
    getFormattedDurationTranscriptionStart,
    isFinalVoiceCallStatus,
    isMissedInboundVoiceCall,
    processEvents,
} from '../utils'

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
            expect(isFinalVoiceCallStatus(VoiceCallStatus.Missed)).toBe(true)
        })

        it('should return false for non-final voice call statuses', () => {
            expect(isFinalVoiceCallStatus(VoiceCallStatus.Answered)).toBe(false)
            expect(isFinalVoiceCallStatus(VoiceCallStatus.Connected)).toBe(
                false,
            )
            expect(isFinalVoiceCallStatus(VoiceCallStatus.InProgress)).toBe(
                false,
            )
            expect(isFinalVoiceCallStatus(VoiceCallStatus.Initiated)).toBe(
                false,
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
                momentUtils.stringToDatetime('2023-01-01 10:10:10') as any,
            )
            expect(getFormattedDurationOngoingCall('2023-01-01 10:10:10')).toBe(
                '00:00',
            )
            expect(getFormattedDurationOngoingCall('2023-01-01 10:10:09')).toBe(
                '00:01',
            )
            expect(getFormattedDurationOngoingCall('2023-01-01 10:09:10')).toBe(
                '01:00',
            )
            expect(getFormattedDurationOngoingCall('2023-01-01 09:10:10')).toBe(
                '01:00:00',
            )
            expect(getFormattedDurationOngoingCall('2023-01-01 09:09:09')).toBe(
                '01:01:01',
            )
        })
    })

    describe('processEvents', () => {
        it('should return an empty array when passed an empty array', () => {
            const result = processEvents([])
            expect(result).toEqual([])
        })

        it('should return an array of objects with the correct text and user_id properties', () => {
            const events: VoiceCallEvent[] = [
                {
                    type: PhoneIntegrationEvent.PhoneCallRinging,
                    user_id: 2,
                    created_datetime: '10:02 AM',
                },
                {
                    type: PhoneIntegrationEvent.DeclinedPhoneCall,
                    user_id: 2,
                    created_datetime: '10:03 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallRinging,
                    user_id: 3,
                    created_datetime: '10:04 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallRinging,
                    user_id: 4,
                    created_datetime: '10:05 AM',
                },
                {
                    type: PhoneIntegrationEvent.ChildCallNotAnswered,
                    user_id: 4,
                    created_datetime: '03:02 PM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallRinging,
                    user_id: 5,
                    created_datetime: '03:03 PM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallAnswered,
                    user_id: 5,
                    created_datetime: '03:04 PM',
                },
                {
                    type: PhoneIntegrationEvent.OutgoingPhoneCallConnected,
                    user_id: null,
                    customer_id: 7,
                    created_datetime: '03:05 PM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                    user_id: 8,
                    created_datetime: '03:06 PM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallTransferFailed,
                    user_id: 9,
                    created_datetime: '03:07 PM',
                },
            ] as VoiceCallEvent[]
            const result = processEvents(events)
            expect(result).toEqual([
                { text: 'Declined by ', userId: 2, datetime: '10:03 AM' },
                { text: 'Missed by ', userId: 3, datetime: '10:04 AM' },
                { text: 'Missed by ', userId: 4, datetime: '10:05 AM' },
                { text: 'Answered by ', userId: 5, datetime: '03:04 PM' },
                {
                    text: 'Answered by ',
                    userId: null,
                    customerId: 7,
                    datetime: '03:05 PM',
                },
                {
                    text: 'Transfer initiated by ',
                    userId: 8,
                    datetime: '03:06 PM',
                },
                {
                    text: 'Transfer failed to ',
                    userId: 9,
                    datetime: '03:07 PM',
                },
            ])
        })

        it('should not include events that are not PhoneCallAnswered, DeclinedPhoneCall, PhoneCallRinging, or ChildCallNotAnswered', () => {
            const events: VoiceCallEvent[] = [
                { type: PhoneIntegrationEvent.PhoneCallAnswered, user_id: 1 },
                { type: PhoneIntegrationEvent.DeclinedPhoneCall, user_id: 2 },
                { type: PhoneIntegrationEvent.PhoneCallRinging, user_id: 3 },
                { type: 'some other event', user_id: 4 },
            ] as VoiceCallEvent[]
            const result = processEvents(events)
            expect(result).toEqual([
                { text: 'Answered by ', userId: 1 },
                { text: 'Declined by ', userId: 2 },
                { text: 'Missed by ', userId: 3 },
            ])
        })

        it('should handle cases where there is a ChildCallNotAnswered event for missed call', () => {
            const events: VoiceCallEvent[] = [
                { type: PhoneIntegrationEvent.PhoneCallRinging, user_id: 1 },
                {
                    type: PhoneIntegrationEvent.ChildCallNotAnswered,
                    user_id: 1,
                },
            ] as VoiceCallEvent[]
            const result = processEvents(events)
            expect(result).toEqual([{ text: 'Missed by ', userId: 1 }])
        })

        it('should handle transfers', () => {
            const events: VoiceCallEvent[] = [
                {
                    type: PhoneIntegrationEvent.PhoneCallRinging,
                    user_id: 2,
                    created_datetime: '10:00 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallAnswered,
                    user_id: 1,
                    created_datetime: '10:01 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                    user_id: 1,
                    created_datetime: '10:02 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallTransferFailed,
                    user_id: 1,
                    created_datetime: '10:03 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                    user_id: 1,
                    created_datetime: '10:04 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallAnswered,
                    user_id: 2,
                    created_datetime: '10:05 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                    user_id: 2,
                    created_datetime: '10:04 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallRinging,
                    user_id: 3,
                    created_datetime: '10:06 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallTransferFailed,
                    user_id: 3,
                    created_datetime: '10:06 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                    user_id: 2,
                    created_datetime: '10:07 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallRinging,
                    user_id: 3,
                    created_datetime: '10:08 AM',
                },
                {
                    type: PhoneIntegrationEvent.DeclinedPhoneCall,
                    user_id: 3,
                    created_datetime: '10:09 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallTransferFailed,
                    user_id: 3,
                    created_datetime: '10:10 AM',
                },
            ] as VoiceCallEvent[]
            const result = processEvents(events)
            expect(result).toEqual([
                { text: 'Missed by ', userId: 2, datetime: '10:00 AM' },
                { text: 'Answered by ', userId: 1, datetime: '10:01 AM' },
                {
                    text: 'Transfer initiated by ',
                    userId: 1,
                    datetime: '10:02 AM',
                },
                {
                    text: 'Transfer failed to ',
                    userId: 1,
                    datetime: '10:03 AM',
                },
                {
                    datetime: '10:04 AM',
                    text: 'Transfer initiated by ',
                    userId: 1,
                },
                {
                    text: 'Transfer answered by ',
                    userId: 2,
                    datetime: '10:05 AM',
                },
                {
                    datetime: '10:04 AM',
                    text: 'Transfer initiated by ',
                    userId: 2,
                },
                {
                    text: 'Transfer missed by ',
                    userId: 3,
                    datetime: '10:06 AM',
                },
                {
                    datetime: '10:07 AM',
                    text: 'Transfer initiated by ',
                    userId: 2,
                },
                {
                    text: 'Transfer declined by ',
                    userId: 3,
                    datetime: '10:09 AM',
                },
            ])
        })

        it('should handle ongoing transfers', () => {
            const events: VoiceCallEvent[] = [
                {
                    type: PhoneIntegrationEvent.PhoneCallRinging,
                    user_id: 2,
                    created_datetime: '10:00 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallAnswered,
                    user_id: 1,
                    created_datetime: '10:01 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                    user_id: 1,
                    created_datetime: '10:02 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallRinging,
                    user_id: 3,
                    created_datetime: '10:03 AM',
                },
            ] as VoiceCallEvent[]
            const result = processEvents(events)
            expect(result).toEqual([
                { text: 'Missed by ', userId: 2, datetime: '10:00 AM' },
                { text: 'Answered by ', userId: 1, datetime: '10:01 AM' },
                {
                    text: 'Transfer initiated by ',
                    userId: 1,
                    datetime: '10:02 AM',
                },
            ])
        })

        it('should handle ended missed transfers', () => {
            const events: VoiceCallEvent[] = [
                {
                    type: PhoneIntegrationEvent.PhoneCallRinging,
                    user_id: 2,
                    created_datetime: '10:00 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallAnswered,
                    user_id: 1,
                    created_datetime: '10:01 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                    user_id: 1,
                    created_datetime: '10:02 AM',
                },
                {
                    type: PhoneIntegrationEvent.PhoneCallRinging,
                    user_id: 3,
                    created_datetime: '10:03 AM',
                },
                {
                    type: PhoneIntegrationEvent.CompletedPhoneCall,
                    user_id: 4,
                    created_datetime: '10:05 AM',
                },
            ] as VoiceCallEvent[]
            const result = processEvents(events)
            expect(result).toEqual([
                { text: 'Missed by ', userId: 2, datetime: '10:00 AM' },
                { text: 'Answered by ', userId: 1, datetime: '10:01 AM' },
                {
                    text: 'Transfer initiated by ',
                    userId: 1,
                    datetime: '10:02 AM',
                },
                {
                    text: 'Transfer missed by ',
                    userId: 3,
                    datetime: '10:03 AM',
                },
            ])
        })

        describe('isMissedInboundVoiceCall', () => {
            it('should return true for missed inbound calls', () => {
                expect(
                    isMissedInboundVoiceCall({
                        direction: 'inbound',
                        status: VoiceCallStatus.Completed,
                    } as VoiceCall),
                ).toBe(true)
                expect(
                    isMissedInboundVoiceCall({
                        direction: 'inbound',
                        status: VoiceCallStatus.Ending,
                    } as VoiceCall),
                ).toBe(true)
            })

            it.each([
                VoiceCallStatus.Ringing,
                VoiceCallStatus.Queued,
                VoiceCallStatus.Answered,
                VoiceCallStatus.Connected,
                VoiceCallStatus.InProgress,
            ])(
                'should return false for inbound calls with status %s',
                (status) => {
                    expect(
                        isMissedInboundVoiceCall({
                            direction: 'inbound',
                            status,
                        } as VoiceCall),
                    ).toBe(false)
                },
            )

            it.each([VoiceCallStatus.Completed, VoiceCallStatus.Ending])(
                'should return false for outbound calls with status %s',
                (status) => {
                    expect(
                        isMissedInboundVoiceCall({
                            direction: 'outbound',
                            status,
                        } as VoiceCall),
                    ).toBe(false)
                },
            )
        })
    })

    describe('getFormattedDurationTranscriptionStart', () => {
        it('should return formatted duration for transcription start', () => {
            expect(getFormattedDurationTranscriptionStart(10)).toBe('00:10')
            expect(getFormattedDurationTranscriptionStart(65)).toBe('01:05')
        })
    })
})
