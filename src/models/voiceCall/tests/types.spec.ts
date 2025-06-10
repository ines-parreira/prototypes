import {
    VoiceCallStatus,
    VoiceCallTerminationStatus,
} from '@gorgias/helpdesk-queries'

import { voiceCall } from 'fixtures/voiceCalls'
import { getCombinations } from 'utils/testing'

import {
    getInboundDisplayStatus,
    getOutboundDisplayStatus,
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

describe('getInboundDisplayStatus', () => {
    it.each([
        {
            status: VoiceCallStatus.Ringing,
            displayStatus: VoiceCallDisplayStatus.Routing,
        },
        {
            status: VoiceCallStatus.Initiated,
            displayStatus: VoiceCallDisplayStatus.Routing,
        },
        {
            status: VoiceCallStatus.InProgress,
            displayStatus: VoiceCallDisplayStatus.Routing,
        },
        {
            status: VoiceCallStatus.Queued,
            displayStatus: VoiceCallDisplayStatus.Queued,
            status_in_queue: 'waiting',
        },
        {
            status: VoiceCallStatus.Queued,
            displayStatus: VoiceCallDisplayStatus.Calling,
            status_in_queue: 'distributing',
        },
        {
            status: VoiceCallStatus.Answered,
            displayStatus: VoiceCallDisplayStatus.InProgress,
        },
        {
            status: VoiceCallStatus.Connected,
            displayStatus: VoiceCallDisplayStatus.InProgress,
        },
        {
            status: 'unknown' as VoiceCallStatus,
            displayStatus: null,
        },
    ])(
        'should return the correct non-final display status for inbound calls ($status, $status_in_queue)',
        ({ status, status_in_queue, displayStatus }) => {
            expect(
                getInboundDisplayStatus(
                    status,
                    undefined,
                    undefined,
                    status_in_queue,
                ),
            ).toBe(displayStatus)
        },
    )

    it.each(
        getCombinations(
            [
                { status: VoiceCallStatus.Completed },
                { status: VoiceCallStatus.Ending },
                { status: VoiceCallStatus.NoAnswer },
                { status: VoiceCallStatus.Busy },
                { status: VoiceCallStatus.Failed },
                { status: VoiceCallStatus.Canceled },
                { status: VoiceCallStatus.Missed },
            ],
            [
                {
                    lastAnsweredByAgentId: null,
                    displayStatus: VoiceCallDisplayStatus.Missed,
                },
                {
                    lastAnsweredByAgentId: 42,
                    displayStatus: VoiceCallDisplayStatus.Answered,
                },
            ],
        ),
    )(
        'should return the correct legacy final display status for inbound calls ($status, $lastAnsweredByAgentId)',
        ({ status, lastAnsweredByAgentId, displayStatus }) => {
            expect(
                getInboundDisplayStatus(
                    status,
                    undefined,
                    lastAnsweredByAgentId,
                ),
            ).toBe(displayStatus)
        },
    )

    it.each(
        getCombinations(
            [
                { status: VoiceCallStatus.Completed },
                { status: VoiceCallStatus.Ending },
                { status: VoiceCallStatus.NoAnswer },
                { status: VoiceCallStatus.Busy },
                { status: VoiceCallStatus.Failed },
                { status: VoiceCallStatus.Canceled },
                { status: VoiceCallStatus.Missed },
            ],
            [
                {
                    terminationStatus: VoiceCallTerminationStatus.Answered,
                    displayStatus: VoiceCallDisplayStatus.Answered,
                },
                {
                    terminationStatus: VoiceCallTerminationStatus.Missed,
                    displayStatus: VoiceCallDisplayStatus.Missed,
                },
                {
                    terminationStatus: VoiceCallTerminationStatus.Abandoned,
                    displayStatus: VoiceCallDisplayStatus.Abandoned,
                },
                {
                    terminationStatus: VoiceCallTerminationStatus.Cancelled,
                    displayStatus: VoiceCallDisplayStatus.Cancelled,
                },
                {
                    terminationStatus:
                        VoiceCallTerminationStatus.CallbackRequested,
                    displayStatus: VoiceCallDisplayStatus.CallbackRequested,
                },
            ],
        ),
    )(
        `should return the correct final display status for inbound calls ($status, $terminationStatus)`,
        ({ status, terminationStatus, displayStatus }) => {
            expect(getInboundDisplayStatus(status, terminationStatus)).toBe(
                displayStatus,
            )
        },
    )
})

describe('getOutboundDisplayStatus', () => {
    it.each([
        {
            status: VoiceCallStatus.Ringing,
            displayStatus: VoiceCallDisplayStatus.Ringing,
        },
        {
            status: VoiceCallStatus.InProgress,
            displayStatus: VoiceCallDisplayStatus.Ringing,
        },
        {
            status: VoiceCallStatus.Queued,
            displayStatus: VoiceCallDisplayStatus.Ringing,
        },
        {
            status: VoiceCallStatus.Initiated,
            displayStatus: VoiceCallDisplayStatus.Ringing,
        },
        {
            status: VoiceCallStatus.Answered,
            displayStatus: VoiceCallDisplayStatus.InProgress,
        },
        {
            status: VoiceCallStatus.Connected,
            displayStatus: VoiceCallDisplayStatus.InProgress,
        },
        {
            status: VoiceCallStatus.Failed,
            displayStatus: VoiceCallDisplayStatus.Failed,
        },
        {
            status: VoiceCallStatus.Canceled,
            displayStatus: VoiceCallDisplayStatus.Unanswered,
        },
        {
            status: VoiceCallStatus.Busy,
            displayStatus: VoiceCallDisplayStatus.Unanswered,
        },
        {
            status: VoiceCallStatus.NoAnswer,
            displayStatus: VoiceCallDisplayStatus.Unanswered,
        },
        {
            status: VoiceCallStatus.Missed,
            displayStatus: VoiceCallDisplayStatus.Unanswered,
        },
        {
            status: VoiceCallStatus.Completed,
            displayStatus: VoiceCallDisplayStatus.Answered,
        },
        { status: 'unknown' as VoiceCallStatus, displayStatus: null },
    ])(
        'should return the correct display status for outbound calls',
        ({ status, displayStatus }) => {
            expect(getOutboundDisplayStatus(status)).toBe(displayStatus)
        },
    )
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
        [VoiceCallDisplayStatus.CallbackRequested, 'Callback Requested'],
        [VoiceCallDisplayStatus.Queued, 'Queued'],
    ])(
        'should return the correct display name for each status',
        (displayStatus, prettyName) => {
            expect(getPrettyVoiceCallDisplayStatusName(displayStatus)).toBe(
                prettyName,
            )
        },
    )
})
