import {
    VoiceCallStatus,
    VoiceCallTerminationStatus,
} from '@gorgias/helpdesk-types'

import {
    getInboundDisplayStatus,
    getOutboundDisplayStatus,
    getPrettyVoiceCallDisplayStatusName,
} from '../models/statusMapping'
import { VoiceCallDisplayStatus } from '../models/types'

describe('getInboundDisplayStatus', () => {
    it('returns Routing for Ringing status', () => {
        expect(getInboundDisplayStatus(VoiceCallStatus.Ringing)).toBe(
            VoiceCallDisplayStatus.Routing,
        )
    })

    it('returns Routing for Initiated status', () => {
        expect(getInboundDisplayStatus(VoiceCallStatus.Initiated)).toBe(
            VoiceCallDisplayStatus.Routing,
        )
    })

    it('returns Routing for InProgress status', () => {
        expect(getInboundDisplayStatus(VoiceCallStatus.InProgress)).toBe(
            VoiceCallDisplayStatus.Routing,
        )
    })

    it('returns Queued for Queued status without distributing', () => {
        expect(getInboundDisplayStatus(VoiceCallStatus.Queued)).toBe(
            VoiceCallDisplayStatus.Queued,
        )
    })

    it('returns Calling for Queued status with distributing', () => {
        expect(
            getInboundDisplayStatus(
                VoiceCallStatus.Queued,
                undefined,
                undefined,
                'distributing',
            ),
        ).toBe(VoiceCallDisplayStatus.Calling)
    })

    it('returns InProgress for Answered status', () => {
        expect(getInboundDisplayStatus(VoiceCallStatus.Answered)).toBe(
            VoiceCallDisplayStatus.InProgress,
        )
    })

    it('returns InProgress for Connected status', () => {
        expect(getInboundDisplayStatus(VoiceCallStatus.Connected)).toBe(
            VoiceCallDisplayStatus.InProgress,
        )
    })

    it('returns Answered via termination_status for Completed', () => {
        expect(
            getInboundDisplayStatus(
                VoiceCallStatus.Completed,
                VoiceCallTerminationStatus.Answered,
            ),
        ).toBe(VoiceCallDisplayStatus.Answered)
    })

    it('returns Missed via termination_status for Completed', () => {
        expect(
            getInboundDisplayStatus(
                VoiceCallStatus.Completed,
                VoiceCallTerminationStatus.Missed,
            ),
        ).toBe(VoiceCallDisplayStatus.Missed)
    })

    it('returns Abandoned via termination_status', () => {
        expect(
            getInboundDisplayStatus(
                VoiceCallStatus.Completed,
                VoiceCallTerminationStatus.Abandoned,
            ),
        ).toBe(VoiceCallDisplayStatus.Abandoned)
    })

    it('returns CallbackRequested via termination_status', () => {
        expect(
            getInboundDisplayStatus(
                VoiceCallStatus.Completed,
                VoiceCallTerminationStatus.CallbackRequested,
            ),
        ).toBe(VoiceCallDisplayStatus.CallbackRequested)
    })

    it('returns Cancelled via termination_status', () => {
        expect(
            getInboundDisplayStatus(
                VoiceCallStatus.Completed,
                VoiceCallTerminationStatus.Cancelled,
            ),
        ).toBe(VoiceCallDisplayStatus.Cancelled)
    })

    it('uses legacy fallback: Missed when lastAnsweredByAgentId is null', () => {
        expect(
            getInboundDisplayStatus(VoiceCallStatus.Completed, undefined, null),
        ).toBe(VoiceCallDisplayStatus.Missed)
    })

    it('uses legacy fallback: Answered when lastAnsweredByAgentId is set', () => {
        expect(
            getInboundDisplayStatus(VoiceCallStatus.Completed, undefined, 42),
        ).toBe(VoiceCallDisplayStatus.Answered)
    })

    it('returns null for unknown status', () => {
        expect(getInboundDisplayStatus('unknown' as VoiceCallStatus)).toBeNull()
    })
})

describe('getOutboundDisplayStatus', () => {
    it('returns Ringing for Ringing status', () => {
        expect(getOutboundDisplayStatus(VoiceCallStatus.Ringing)).toBe(
            VoiceCallDisplayStatus.Ringing,
        )
    })

    it('returns Ringing for Initiated status', () => {
        expect(getOutboundDisplayStatus(VoiceCallStatus.Initiated)).toBe(
            VoiceCallDisplayStatus.Ringing,
        )
    })

    it('returns InProgress for Answered status', () => {
        expect(getOutboundDisplayStatus(VoiceCallStatus.Answered)).toBe(
            VoiceCallDisplayStatus.InProgress,
        )
    })

    it('returns InProgress for Connected status', () => {
        expect(getOutboundDisplayStatus(VoiceCallStatus.Connected)).toBe(
            VoiceCallDisplayStatus.InProgress,
        )
    })

    it('returns Answered for Completed status', () => {
        expect(getOutboundDisplayStatus(VoiceCallStatus.Completed)).toBe(
            VoiceCallDisplayStatus.Answered,
        )
    })

    it('returns Failed for Failed status', () => {
        expect(getOutboundDisplayStatus(VoiceCallStatus.Failed)).toBe(
            VoiceCallDisplayStatus.Failed,
        )
    })

    it('returns Unanswered for Canceled status', () => {
        expect(getOutboundDisplayStatus(VoiceCallStatus.Canceled)).toBe(
            VoiceCallDisplayStatus.Unanswered,
        )
    })

    it('returns Unanswered for Busy status', () => {
        expect(getOutboundDisplayStatus(VoiceCallStatus.Busy)).toBe(
            VoiceCallDisplayStatus.Unanswered,
        )
    })

    it('returns Unanswered for NoAnswer status', () => {
        expect(getOutboundDisplayStatus(VoiceCallStatus.NoAnswer)).toBe(
            VoiceCallDisplayStatus.Unanswered,
        )
    })

    it('returns null for unknown status', () => {
        expect(
            getOutboundDisplayStatus('unknown' as VoiceCallStatus),
        ).toBeNull()
    })
})

describe('getPrettyVoiceCallDisplayStatusName', () => {
    const cases: [VoiceCallDisplayStatus, string][] = [
        [VoiceCallDisplayStatus.Ringing, 'Ringing'],
        [VoiceCallDisplayStatus.Routing, 'Routing'],
        [VoiceCallDisplayStatus.InProgress, 'In Progress'],
        [VoiceCallDisplayStatus.Answered, 'Answered'],
        [VoiceCallDisplayStatus.Missed, 'Missed'],
        [VoiceCallDisplayStatus.Abandoned, 'Abandoned'],
        [VoiceCallDisplayStatus.Cancelled, 'Cancelled'],
        [VoiceCallDisplayStatus.Failed, 'Failed'],
        [VoiceCallDisplayStatus.Unanswered, 'Unanswered'],
        [VoiceCallDisplayStatus.CallbackRequested, 'Callback Requested'],
        [VoiceCallDisplayStatus.Queued, 'Queued'],
    ]

    it.each(cases)('maps %s to "%s"', (status, expected) => {
        expect(getPrettyVoiceCallDisplayStatusName(status)).toBe(expected)
    })

    it('returns empty string for unknown status', () => {
        expect(
            getPrettyVoiceCallDisplayStatusName(
                'unknown' as VoiceCallDisplayStatus,
            ),
        ).toBe('')
    })
})
