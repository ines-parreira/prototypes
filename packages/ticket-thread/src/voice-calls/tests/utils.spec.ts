import { vi } from 'vitest'

import { VoiceCallDirection, VoiceCallStatus } from '@gorgias/helpdesk-types'

import { VoiceCallSubjectType } from '#voice-calls/models/types'
import {
    getAnsweringVoiceSubject,
    getFormattedDurationEndedCall,
    getFormattedDurationOngoingCall,
    getFormattedDurationTranscriptionStart,
    isCallBeingTransferredToQueue,
    isCallInProgress,
    isCallTransfer,
    isFinalVoiceCallStatus,
    shouldShowDuration,
} from '#voice-calls/models/utils'

describe('isFinalVoiceCallStatus', () => {
    const finalStatuses = [
        VoiceCallStatus.Busy,
        VoiceCallStatus.Canceled,
        VoiceCallStatus.Completed,
        VoiceCallStatus.Failed,
        VoiceCallStatus.NoAnswer,
        VoiceCallStatus.Ending,
        VoiceCallStatus.Missed,
    ]

    it.each(finalStatuses)('returns true for %s', (status) => {
        expect(isFinalVoiceCallStatus(status)).toBe(true)
    })

    it('returns false for Ringing', () => {
        expect(isFinalVoiceCallStatus(VoiceCallStatus.Ringing)).toBe(false)
    })

    it('returns false for InProgress', () => {
        expect(isFinalVoiceCallStatus(VoiceCallStatus.InProgress)).toBe(false)
    })
})

describe('getFormattedDurationEndedCall', () => {
    it('formats seconds only', () => {
        expect(getFormattedDurationEndedCall(45)).toBe('45s')
    })

    it('formats minutes and seconds', () => {
        expect(getFormattedDurationEndedCall(125)).toBe('2m 5s')
    })

    it('formats hours, minutes and seconds', () => {
        expect(getFormattedDurationEndedCall(3661)).toBe('1h 1m 1s')
    })

    it('formats zero duration', () => {
        expect(getFormattedDurationEndedCall(0)).toBe('0s')
    })
})

describe('getFormattedDurationTranscriptionStart', () => {
    it('zero-pads minutes and seconds', () => {
        expect(getFormattedDurationTranscriptionStart(65)).toBe('01:05')
    })

    it('formats zero', () => {
        expect(getFormattedDurationTranscriptionStart(0)).toBe('00:00')
    })

    it('formats large values', () => {
        expect(getFormattedDurationTranscriptionStart(600)).toBe('10:00')
    })
})

describe('getFormattedDurationOngoingCall', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('returns MM:SS format for a call under 1 hour', () => {
        vi.setSystemTime(new Date('2024-01-01T10:01:05Z'))
        expect(getFormattedDurationOngoingCall('2024-01-01T10:00:00Z')).toBe(
            '01:05',
        )
    })

    it('returns HH:MM:SS format when elapsed time is 1 hour or more', () => {
        vi.setSystemTime(new Date('2024-01-01T11:01:05Z'))
        expect(getFormattedDurationOngoingCall('2024-01-01T10:00:00Z')).toBe(
            '01:01:05',
        )
    })

    it('returns 00:00 when started_datetime is in the future (clamps to zero)', () => {
        vi.setSystemTime(new Date('2024-01-01T10:00:00Z'))
        expect(getFormattedDurationOngoingCall('2024-01-01T10:00:05Z')).toBe(
            '00:00',
        )
    })
})

describe('getAnsweringVoiceSubject', () => {
    it('returns External subject when answered_by_external_number is set', () => {
        const result = getAnsweringVoiceSubject({
            answered_by_external_number: '+12025551234',
            answered_by_external_customer_id: undefined,
            last_answered_by_agent_id: null,
        })
        expect(result).toEqual({
            type: VoiceCallSubjectType.External,
            value: '+12025551234',
            customer: null,
        })
    })

    it('includes customer id in External subject when provided', () => {
        const result = getAnsweringVoiceSubject({
            answered_by_external_number: '+12025551234',
            answered_by_external_customer_id: 99,
            last_answered_by_agent_id: null,
        })
        expect(result).toEqual({
            type: VoiceCallSubjectType.External,
            value: '+12025551234',
            customer: { id: 99 },
        })
    })

    it('returns Agent subject when last_answered_by_agent_id is set', () => {
        const result = getAnsweringVoiceSubject({
            answered_by_external_number: undefined,
            last_answered_by_agent_id: 42,
        })
        expect(result).toEqual({
            type: VoiceCallSubjectType.Agent,
            id: 42,
        })
    })

    it('returns null when neither field is set', () => {
        const result = getAnsweringVoiceSubject({
            answered_by_external_number: undefined,
            last_answered_by_agent_id: null,
        })
        expect(result).toBeNull()
    })
})

describe('isCallTransfer', () => {
    const base = { status: VoiceCallStatus.Completed }

    it('returns true for inbound with agent id', () => {
        expect(
            isCallTransfer({
                ...base,
                direction: VoiceCallDirection.Inbound,
                last_answered_by_agent_id: 1,
                answered_by_external_number: undefined,
            }),
        ).toBe(true)
    })

    it('returns false for inbound without agent id or external number', () => {
        expect(
            isCallTransfer({
                ...base,
                direction: VoiceCallDirection.Inbound,
                last_answered_by_agent_id: null,
                answered_by_external_number: undefined,
            }),
        ).toBe(false)
    })

    it('returns true for outbound with agent id', () => {
        expect(
            isCallTransfer({
                ...base,
                direction: VoiceCallDirection.Outbound,
                last_answered_by_agent_id: 1,
                answered_by_external_number: undefined,
            }),
        ).toBe(true)
    })

    it('returns true for outbound with Queued status', () => {
        expect(
            isCallTransfer({
                status: VoiceCallStatus.Queued,
                direction: VoiceCallDirection.Outbound,
                last_answered_by_agent_id: null,
                answered_by_external_number: undefined,
            }),
        ).toBe(true)
    })

    it('returns false for unknown direction', () => {
        expect(
            isCallTransfer({
                ...base,
                direction: 'unknown',
                last_answered_by_agent_id: 1,
                answered_by_external_number: undefined,
            }),
        ).toBe(false)
    })
})

describe('isCallBeingTransferredToQueue', () => {
    it('returns true when Queued + has answered agent', () => {
        expect(
            isCallBeingTransferredToQueue({
                status: VoiceCallStatus.Queued,
                direction: VoiceCallDirection.Inbound,
                last_answered_by_agent_id: 1,
            }),
        ).toBe(true)
    })

    it('returns true when Queued + outbound direction', () => {
        expect(
            isCallBeingTransferredToQueue({
                status: VoiceCallStatus.Queued,
                direction: VoiceCallDirection.Outbound,
                last_answered_by_agent_id: null,
            }),
        ).toBe(true)
    })

    it('returns false when not Queued', () => {
        expect(
            isCallBeingTransferredToQueue({
                status: VoiceCallStatus.Ringing,
                direction: VoiceCallDirection.Inbound,
                last_answered_by_agent_id: 1,
            }),
        ).toBe(false)
    })
})

describe('isCallInProgress', () => {
    const base = {
        direction: VoiceCallDirection.Inbound,
        last_answered_by_agent_id: null,
    }

    it('returns true for Answered status', () => {
        expect(
            isCallInProgress({ ...base, status: VoiceCallStatus.Answered }),
        ).toBe(true)
    })

    it('returns true for Connected status', () => {
        expect(
            isCallInProgress({ ...base, status: VoiceCallStatus.Connected }),
        ).toBe(true)
    })

    it('returns true when call is being transferred to queue', () => {
        expect(
            isCallInProgress({
                status: VoiceCallStatus.Queued,
                direction: VoiceCallDirection.Inbound,
                last_answered_by_agent_id: 1,
            }),
        ).toBe(true)
    })

    it('returns false for Ringing', () => {
        expect(
            isCallInProgress({ ...base, status: VoiceCallStatus.Ringing }),
        ).toBe(false)
    })
})

describe('shouldShowDuration', () => {
    const inbound = { direction: VoiceCallDirection.Inbound }
    const outbound = { direction: VoiceCallDirection.Outbound }

    it('returns false for non-transfer missed inbound (Canceled)', () => {
        expect(
            shouldShowDuration({
                ...inbound,
                status: VoiceCallStatus.Canceled,
                last_answered_by_agent_id: null,
                answered_by_external_number: undefined,
            }),
        ).toBe(false)
    })

    it('returns true for transferred inbound even if status is Canceled', () => {
        expect(
            shouldShowDuration({
                ...inbound,
                status: VoiceCallStatus.Canceled,
                last_answered_by_agent_id: 1,
                answered_by_external_number: undefined,
            }),
        ).toBe(true)
    })

    it('returns false for Ringing (no duration)', () => {
        expect(
            shouldShowDuration({
                ...outbound,
                status: VoiceCallStatus.Ringing,
                last_answered_by_agent_id: null,
                answered_by_external_number: undefined,
            }),
        ).toBe(false)
    })

    it('returns true for Completed outbound', () => {
        expect(
            shouldShowDuration({
                ...outbound,
                status: VoiceCallStatus.Completed,
                last_answered_by_agent_id: null,
                answered_by_external_number: undefined,
            }),
        ).toBe(true)
    })
})
