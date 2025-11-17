import { VoiceCallDirection, VoiceCallStatus } from '@gorgias/helpdesk-types'

import { PhoneIntegrationEvent } from 'constants/integrations/types/event'
import type { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { voiceCall } from 'fixtures/voiceCalls'
import * as momentUtils from 'utils/date'

import type { VoiceCall, VoiceCallEvent } from '../types'
import { VoiceCallSubjectType } from '../types'
import {
    DEPRECATED_processEvents,
    getAnsweringVoiceSubject,
    getFormattedDurationEndedCall,
    getFormattedDurationOngoingCall,
    getFormattedDurationTranscriptionStart,
    getInCallAgentId,
    getTransferTargetVoiceCallSubject,
    isCallAnsweredByExternalNumber,
    isCallBeingMonitored,
    isCallBeingTransferredToQueue,
    isCallInProgress,
    isCallTransfer,
    isFinalVoiceCallStatus,
    isMissedInboundVoiceCall,
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

    describe('DEPRECATED_processEvents', () => {
        it('should return an empty array when passed an empty array', () => {
            const result = DEPRECATED_processEvents([])
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
            const result = DEPRECATED_processEvents(events)
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
            const result = DEPRECATED_processEvents(events)
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
            const result = DEPRECATED_processEvents(events)
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
            const result = DEPRECATED_processEvents(events)
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
            const result = DEPRECATED_processEvents(events)
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
            const result = DEPRECATED_processEvents(events)
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

    describe('getAnsweringVoiceSubject', () => {
        it('should return agent subject if last answered by agent', () => {
            const subject = getAnsweringVoiceSubject({
                ...voiceCall,
                last_answered_by_agent_id: 42,
            })

            expect(subject).toEqual({
                type: VoiceCallSubjectType.Agent,
                id: 42,
            })
        })

        it('should return external number subject if last answered by external number', () => {
            const subject = getAnsweringVoiceSubject({
                ...voiceCall,
                last_answered_by_agent_id: 42,
                answered_by_external_number: '+1234567890',
            })

            expect(subject).toEqual({
                type: VoiceCallSubjectType.External,
                value: '+1234567890',
                customer: null,
            })
        })

        it('should return external number subject with customer information if last answered by external number and customer is known', () => {
            const subject = getAnsweringVoiceSubject({
                ...voiceCall,
                answered_by_external_number: '+1234567890',
                answered_by_external_customer_id: 123,
            })

            expect(subject).toEqual({
                type: VoiceCallSubjectType.External,
                value: '+1234567890',
                customer: { id: 123 },
            })
        })

        it('should return null if no subject is found', () => {
            const subject = getAnsweringVoiceSubject({
                ...voiceCall,
                last_answered_by_agent_id: null,
            })

            expect(subject).toBeNull()
        })
    })

    describe('isCallTransfer', () => {
        describe('inbound calls', () => {
            it.each([
                {
                    direction: VoiceCallDirection.Inbound,
                    last_answered_by_agent_id: 1,
                },
                {
                    direction: VoiceCallDirection.Inbound,
                    answered_by_external_number: '+1234567890',
                },
                {
                    direction: VoiceCallDirection.Inbound,
                    last_answered_by_agent_id: 1,
                    answered_by_external_number: '+1234567890',
                },
            ])(
                'should detect that an inbound call is a transfer',
                (voiceCall) => {
                    expect(isCallTransfer(voiceCall as VoiceCall)).toBe(true)
                },
            )

            it('should detect that an inbound call is not a transfer', () => {
                expect(
                    isCallTransfer({
                        direction: VoiceCallDirection.Inbound,
                        last_answered_by_agent_id: null,
                    } as VoiceCall),
                ).toBe(false)
            })
        })

        describe('outbound calls', () => {
            it.each([
                {
                    direction: VoiceCallDirection.Outbound,
                    last_answered_by_agent_id: 1,
                },
                {
                    direction: VoiceCallDirection.Outbound,
                    answered_by_external_number: '+1234567890',
                },
                {
                    direction: VoiceCallDirection.Outbound,
                    last_answered_by_agent_id: 1,
                    answered_by_external_number: '+1234567890',
                },
                {
                    direction: VoiceCallDirection.Outbound,
                    last_answered_by_agent_id: null,
                    status: VoiceCallStatus.Queued,
                },
            ])(
                'should detect that an outbound call is a transfer',
                (voiceCall) => {
                    expect(isCallTransfer(voiceCall as VoiceCall)).toBe(true)
                },
            )

            it('should detect that an outbound call is not a transfer', () => {
                expect(
                    isCallTransfer({
                        direction: VoiceCallDirection.Outbound,
                        last_answered_by_agent_id: null,
                        status: VoiceCallStatus.InProgress,
                    } as VoiceCall),
                ).toBe(false)
            })
        })
    })

    describe('getTransferTargetVoiceCallSubject', () => {
        it('should return agent subject when transferType is "agent" and transferTargetAgentId is present', () => {
            const result = getTransferTargetVoiceCallSubject({
                transferType: 'agent',
                transferTargetAgentId: 123,
            } as VoiceCallSummary)

            expect(result).toEqual({
                type: VoiceCallSubjectType.Agent,
                id: 123,
            })
        })

        it('should return external subject when transferType is "external" and transferTargetExternalNumber is present', () => {
            const result = getTransferTargetVoiceCallSubject({
                transferType: 'external',
                transferTargetExternalNumber: '+1234567890',
            } as VoiceCallSummary)

            expect(result).toEqual({
                type: VoiceCallSubjectType.External,
                value: '+1234567890',
            })
        })

        it('should return queue subject when transferType is "queue" and transferTargetQueueId is present', () => {
            const result = getTransferTargetVoiceCallSubject({
                transferType: 'queue',
                transferTargetQueueId: 456,
            } as VoiceCallSummary)

            expect(result).toEqual({
                type: VoiceCallSubjectType.Queue,
                id: 456,
            })
        })

        it.each([
            {
                transferType: 'agent',
            },
            {
                transferType: 'external',
            },
            {
                transferType: 'queue',
            },
            {
                transferType: null,
                transferTargetAgentId: 123,
                transferTargetExternalNumber: '+1234567890',
                transferTargetQueueId: 456,
            },
        ])(
            'should return null when transfer data is incomplete or malformed',
            (voiceCall) => {
                const result = getTransferTargetVoiceCallSubject(
                    voiceCall as VoiceCallSummary,
                )

                expect(result).toBeNull()
            },
        )
    })

    describe('isCallBeingTransferredToQueue', () => {
        it.each([
            {
                direction: VoiceCallDirection.Inbound,
                status: VoiceCallStatus.Queued,
                last_answered_by_agent_id: 42,
            } as VoiceCall,
            {
                direction: VoiceCallDirection.Inbound,
                status: VoiceCallStatus.Queued,
                agentId: 42,
            } as VoiceCallSummary,
        ])(
            'should return true when inbound call is being transferred to a queue',
            (voiceCall) => {
                const result = isCallBeingTransferredToQueue(voiceCall)

                expect(result).toBe(true)
            },
        )

        it.each([
            {
                direction: VoiceCallDirection.Outbound,
                status: VoiceCallStatus.Queued,
            } as VoiceCall,
            {
                direction: VoiceCallDirection.Outbound,
                status: VoiceCallStatus.Queued,
            } as VoiceCallSummary,
        ])(
            'should return true when outbound call is being transferred to a queue',
            (voiceCall) => {
                const result = isCallBeingTransferredToQueue(voiceCall)

                expect(result).toBe(true)
            },
        )

        it.each([
            {
                direction: VoiceCallDirection.Inbound,
                status: VoiceCallStatus.Queued,
                last_answered_by_agent_id: null,
            } as VoiceCall,
            {
                direction: VoiceCallDirection.Inbound,
                status: VoiceCallStatus.Queued,
                agentId: null,
            } as VoiceCallSummary,
        ])(
            'should return false when inbound call is being qeueued',
            (voiceCall) => {
                const result = isCallBeingTransferredToQueue(voiceCall)

                expect(result).toBe(false)
            },
        )
    })

    describe('isCallInProgress', () => {
        it.each([
            {
                direction: VoiceCallDirection.Inbound,
                status: VoiceCallStatus.Answered,
            } as VoiceCall,
            {
                direction: VoiceCallDirection.Inbound,
                status: VoiceCallStatus.Answered,
            } as VoiceCallSummary,
        ])('should return true for answered inbound call', (voiceCall) => {
            const result = isCallInProgress(voiceCall)

            expect(result).toBe(true)
        })

        it.each([
            {
                direction: VoiceCallDirection.Outbound,
                status: VoiceCallStatus.Connected,
            } as VoiceCall,
            {
                direction: VoiceCallDirection.Outbound,
                status: VoiceCallStatus.Connected,
            } as VoiceCallSummary,
        ])('should return true for connected outbound call', (voiceCall) => {
            const result = isCallInProgress(voiceCall)

            expect(result).toBe(true)
        })

        it.each([
            {
                direction: VoiceCallDirection.Inbound,
                status: VoiceCallStatus.Queued,
                last_answered_by_agent_id: 42,
            } as VoiceCall,
            {
                direction: VoiceCallDirection.Inbound,
                status: VoiceCallStatus.Queued,
                agentId: 42,
            } as VoiceCallSummary,
            {
                direction: VoiceCallDirection.Outbound,
                status: VoiceCallStatus.Queued,
            } as VoiceCall,
            {
                direction: VoiceCallDirection.Outbound,
                status: VoiceCallStatus.Queued,
            } as VoiceCallSummary,
        ])(
            'should return true when the call is being transferred to queue',
            (voiceCall) => {
                const result = isCallBeingTransferredToQueue(voiceCall)

                expect(result).toBe(true)
            },
        )

        it.each([
            {
                direction: VoiceCallDirection.Inbound,
                status: VoiceCallStatus.Queued,
            } as VoiceCall,
            {
                direction: VoiceCallDirection.Inbound,
                status: VoiceCallStatus.Queued,
            } as VoiceCallSummary,
        ])(
            'should return false when the call still has to be answered',
            (voiceCall) => {
                const result = isCallBeingTransferredToQueue(voiceCall)

                expect(result).toBe(false)
            },
        )

        it.each([
            {
                status: VoiceCallStatus.Completed,
            } as VoiceCall,
            {
                status: VoiceCallStatus.Completed,
            } as VoiceCallSummary,
        ])('should return false when the call is ended', (voiceCall) => {
            const result = isCallBeingTransferredToQueue(voiceCall)

            expect(result).toBe(false)
        })
    })

    describe('getInCallAgentId', () => {
        it.each([
            {
                voiceCall: {
                    status: VoiceCallStatus.Completed,
                    last_answered_by_agent_id: 42,
                } as VoiceCall,
                inCallAgentId: 42,
            },
            {
                voiceCall: {
                    status: VoiceCallStatus.Completed,
                    initiated_by_agent_id: 42,
                } as VoiceCall,
                inCallAgentId: 42,
            },
            {
                voiceCall: {
                    status: VoiceCallStatus.Completed,
                    last_answered_by_agent_id: 89,
                    initiated_by_agent_id: 42,
                } as VoiceCall,
                inCallAgentId: 89,
            },
            {
                voiceCall: {
                    status: VoiceCallStatus.Completed,
                } as VoiceCall,
                inCallAgentId: null,
            },
            {
                voiceCall: {
                    agentId: 55,
                } as VoiceCallSummary,
                inCallAgentId: 55,
            },
            {
                voiceCall: {
                    agentId: null,
                } as VoiceCallSummary,
                inCallAgentId: null,
            },
        ])('should return correct agent id', ({ voiceCall, inCallAgentId }) => {
            const result = getInCallAgentId(voiceCall)

            expect(result).toEqual(inCallAgentId)
        })
    })

    describe('isCallAnsweredByExternalNumber', () => {
        it('should return true if answered by external number', () => {
            const result = isCallAnsweredByExternalNumber({
                answered_by_external_number: '+123456789',
            } as VoiceCall)

            expect(result).toBe(true)
        })

        it('should return false if not answered by external number', () => {
            const result = isCallAnsweredByExternalNumber({} as VoiceCall)

            expect(result).toBe(false)
        })

        it('should return false for any VoiceCallSummary as we remove them after they are answered by external numbers', () => {
            const result = isCallAnsweredByExternalNumber(
                {} as VoiceCallSummary,
            )

            expect(result).toBe(false)
        })
    })

    describe('isCallBeingMonitored', () => {
        it.each([
            {
                monitoring_status: 'listening',
                last_monitoring_agent_id: 42,
            } as VoiceCall,
            {
                monitoringStatus: 'listening',
                lastMonitoringAgentId: 42,
            } as VoiceCallSummary,
        ])('should return true if call is being monitored', (voiceCall) => {
            const result = isCallBeingMonitored(voiceCall)

            expect(result).toBe(true)
        })

        it.each([
            {} as VoiceCall,
            {} as VoiceCallSummary,
            {
                monitoring_status: 'none',
            } as VoiceCall,
            {
                monitoringStatus: 'none',
            } as VoiceCallSummary,
        ])(
            'should return false if call is not being monitored',
            (voiceCall) => {
                const result = isCallBeingMonitored(voiceCall)

                expect(result).toBe(false)
            },
        )

        it.each([
            {
                monitoring_status: 'listening',
                last_monitoring_agent_id: 42,
            } as VoiceCall,
            {
                monitoringStatus: 'listening',
                lastMonitoringAgentId: 42,
            } as VoiceCallSummary,
        ])(
            'should return true if call is being monitored by a specific agent',
            (voiceCall) => {
                const result = isCallBeingMonitored(voiceCall, 42)

                expect(result).toBe(true)
            },
        )

        it.each([
            {
                monitoring_status: 'listening',
                last_monitoring_agent_id: 42,
            } as VoiceCall,
            {
                monitoringStatus: 'listening',
                lastMonitoringAgentId: 42,
            } as VoiceCallSummary,
        ])(
            'should return false if call is being monitored but by another agent',
            (voiceCall) => {
                const result = isCallBeingMonitored(voiceCall, 89)

                expect(result).toBe(false)
            },
        )
    })
})
