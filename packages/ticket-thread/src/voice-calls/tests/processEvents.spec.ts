import { hasFlowEndEvent, processEvents } from '../models/processEvents'
import { VoiceCallSubjectType } from '../models/types'
import { PhoneIntegrationEvent } from '../models/voiceCallEventTypes'

function makeEvent(
    type: PhoneIntegrationEvent,
    overrides: Partial<{
        user_id: number | null
        meta: Record<string, unknown>
        created_datetime: string
    }> = {},
) {
    return {
        id: Math.random(),
        type,
        account_id: 1,
        call_id: 100,
        customer_id: 200,
        user_id: overrides.user_id ?? 1,
        created_datetime: overrides.created_datetime ?? '2024-01-01T10:00:00Z',
        meta: overrides.meta ?? {},
    }
}

describe('processEvents', () => {
    it('returns empty array for empty input', () => {
        expect(processEvents([])).toEqual([])
    })

    it('actor is null when user_id is null', () => {
        const events = [
            {
                id: 1,
                type: PhoneIntegrationEvent.PhoneCallAnswered,
                account_id: 1,
                call_id: 100,
                customer_id: 200,
                user_id: null,
                created_datetime: '2024-01-01T10:00:00Z',
                meta: {},
            },
        ]
        const result = processEvents(events)
        expect(result[0].actor).toBeNull()
    })

    it('processes OutgoingPhoneCallConnected with full customer meta', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.OutgoingPhoneCallConnected, {
                meta: {
                    customer: {
                        id: 10,
                        name: 'Jane',
                        phone_number: '+14155551234',
                    },
                },
            }),
        ]
        const result = processEvents(events)
        expect(result[0].action).toBe('answered')
        expect(result[0].actor).toEqual({
            type: VoiceCallSubjectType.External,
            value: '+14155551234',
            customer: { id: 10, name: 'Jane' },
        })
    })

    it('actor is null for OutgoingPhoneCallConnected when customer meta is absent', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.OutgoingPhoneCallConnected, {
                meta: {},
            }),
        ]
        const result = processEvents(events)
        expect(result[0].actor).toBeNull()
    })

    it('actor is null for OutgoingPhoneCallConnected when customer has no phone_number', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.OutgoingPhoneCallConnected, {
                meta: { customer: { id: 10, name: 'Jane' } },
            }),
        ]
        const result = processEvents(events)
        expect(result[0].actor).toBeNull()
    })

    it('actor has no customer id when customer id is absent in OutgoingPhoneCallConnected', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.OutgoingPhoneCallConnected, {
                meta: { customer: { phone_number: '+14155551234' } },
            }),
        ]
        const result = processEvents(events)
        expect(result[0].actor).toEqual({
            type: VoiceCallSubjectType.External,
            value: '+14155551234',
            customer: undefined,
        })
    })

    it('actor uses external subject when external_forwarded is true', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallAnswered, {
                meta: {
                    external_forwarded: true,
                    external_phone_number: '+12025551234',
                },
            }),
        ]
        const result = processEvents(events)
        expect(result[0].actor).toEqual({
            type: VoiceCallSubjectType.External,
            value: '+12025551234',
            customer: undefined,
        })
    })

    it('falls back to external_number when external_phone_number is absent in forwarded event', () => {
        const events = [
            makeEvent(
                PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber,
                {
                    meta: { external_number: '+19995551234' },
                },
            ),
        ]
        const result = processEvents(events)
        expect(result[0].target).toMatchObject({
            type: VoiceCallSubjectType.External,
            value: '+19995551234',
        })
    })

    it('includes customer id in external target of forwarded event', () => {
        const events = [
            makeEvent(
                PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber,
                {
                    meta: {
                        external_phone_number: '+12025551234',
                        target_customer_id: 42,
                    },
                },
            ),
        ]
        const result = processEvents(events)
        expect(result[0].target).toMatchObject({ customer: { id: 42 } })
    })

    it('processes transfer to external number using target_external_number', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallTransferInitiated, {
                meta: {
                    target_type: 'external',
                    target_external_number: '+15555551234',
                },
            }),
        ]
        const result = processEvents(events)
        expect(result[0].target).toEqual({
            type: VoiceCallSubjectType.External,
            value: '+15555551234',
            customer: undefined,
        })
    })

    it('uses target as fallback external number in transfer', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallTransferInitiated, {
                meta: { target_type: 'external', target: '+15555551234' },
            }),
        ]
        const result = processEvents(events)
        expect(result[0].target).toMatchObject({ value: '+15555551234' })
    })

    it('includes customer id in external transfer target', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallTransferInitiated, {
                meta: {
                    target_type: 'external',
                    target_external_number: '+15555551234',
                    target_customer_id: 99,
                },
            }),
        ]
        const result = processEvents(events)
        expect(result[0].target).toMatchObject({ customer: { id: 99 } })
    })

    it('processes transfer to queue', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallTransferInitiated, {
                meta: { target_type: 'queue', target_queue_id: 5 },
            }),
        ]
        const result = processEvents(events)
        expect(result[0].target).toEqual({
            type: VoiceCallSubjectType.Queue,
            id: 5,
        })
    })

    it('transfer target is null when no target_type and no target_agent_id', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallTransferInitiated, {
                meta: {},
            }),
        ]
        const result = processEvents(events)
        expect(result[0].target).toBeNull()
    })

    it('PhoneCallRinging is not missed when answered by same agent afterwards', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallRinging, { user_id: 5 }),
            makeEvent(PhoneIntegrationEvent.PhoneCallAnswered, { user_id: 5 }),
        ]
        const result = processEvents(events)
        expect(result).toHaveLength(1)
        expect(result[0].action).toBe('answered')
    })

    it('PhoneCallRinging is not missed when declined by same agent afterwards', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallRinging, { user_id: 5 }),
            makeEvent(PhoneIntegrationEvent.DeclinedPhoneCall, { user_id: 5 }),
        ]
        const result = processEvents(events)
        expect(result).toHaveLength(1)
        expect(result[0].action).toBe('declined')
    })

    it('PhoneCallRinging with external_forwarded uses phone number for missed detection', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallRinging, {
                meta: {
                    external_forwarded: true,
                    external_phone_number: '+12025551234',
                },
            }),
            makeEvent(PhoneIntegrationEvent.ChildCallNotAnswered, {
                meta: { external_phone_number: '+12025551234' },
            }),
        ]
        const result = processEvents(events)
        expect(result).toHaveLength(1)
        expect(result[0].action).toBe('missed')
    })

    it('isMissedEvent uses target_customer_id match for external condition', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallRinging, {
                meta: { external_forwarded: true, target_customer_id: 55 },
            }),
            makeEvent(PhoneIntegrationEvent.ChildCallNotAnswered, {
                meta: { target_customer_id: 55 },
            }),
        ]
        const result = processEvents(events)
        expect(result).toHaveLength(1)
        expect(result[0].action).toBe('missed')
    })

    it('isMissedEvent limits search to events before next PhoneCallTransferInitiated', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallRinging, { user_id: 5 }),
            makeEvent(PhoneIntegrationEvent.PhoneCallAnswered, { user_id: 5 }),
            makeEvent(PhoneIntegrationEvent.PhoneCallTransferInitiated, {
                meta: { target_type: 'agent', target_agent_id: 7 },
            }),
            makeEvent(PhoneIntegrationEvent.ChildCallNotAnswered, {
                user_id: 5,
            }),
        ]
        const result = processEvents(events)
        expect(result.some((e) => e.action === 'missed')).toBe(false)
    })

    it('does not show transfer prefix for queue transfer context', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallTransferInitiated, {
                meta: { target_type: 'queue', target_queue_id: 3 },
            }),
            makeEvent(PhoneIntegrationEvent.PhoneCallAnswered, { user_id: 7 }),
        ]
        const result = processEvents(events)
        expect(result[0].showTransferPrefix).toBe(true)
        expect(result[1].showTransferPrefix).toBe(false)
    })

    it('queue transfer context persists after answered event', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallTransferInitiated, {
                meta: { target_type: 'queue', target_queue_id: 3 },
            }),
            makeEvent(PhoneIntegrationEvent.PhoneCallAnswered, { user_id: 7 }),
            makeEvent(PhoneIntegrationEvent.PhoneCallRinging, { user_id: 8 }),
            makeEvent(PhoneIntegrationEvent.ChildCallNotAnswered, {
                user_id: 8,
            }),
        ]
        const result = processEvents(events)
        expect(
            result.find((e) => e.action === 'missed')?.showTransferPrefix,
        ).toBe(false)
    })

    it('processes PhoneCallAnswered into answered event', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallAnswered, { user_id: 5 }),
        ]
        const result = processEvents(events)
        expect(result).toHaveLength(1)
        expect(result[0].action).toBe('answered')
        expect(result[0].actor).toEqual({
            type: VoiceCallSubjectType.Agent,
            id: 5,
        })
        expect(result[0].showTransferPrefix).toBe(false)
    })

    it('processes DeclinedPhoneCall into declined event', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.DeclinedPhoneCall, { user_id: 5 }),
        ]
        const result = processEvents(events)
        expect(result[0].action).toBe('declined')
        expect(result[0].actor).toEqual({
            type: VoiceCallSubjectType.Agent,
            id: 5,
        })
    })

    it('processes PhoneCallRinging as missed when followed by ChildCallNotAnswered for same agent', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallRinging, { user_id: 5 }),
            makeEvent(PhoneIntegrationEvent.ChildCallNotAnswered, {
                user_id: 5,
            }),
        ]
        const result = processEvents(events)
        expect(result).toHaveLength(1)
        expect(result[0].action).toBe('missed')
        expect(result[0].actor).toEqual({
            type: VoiceCallSubjectType.Agent,
            id: 5,
        })
    })

    it('skips PhoneCallRinging when there are no subsequent events (ongoing)', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallRinging, { user_id: 5 }),
        ]
        const result = processEvents(events)
        expect(result).toHaveLength(0)
    })

    it('processes PhoneCallTransferInitiated to agent', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallTransferInitiated, {
                user_id: 5,
                meta: { target_type: 'agent', target_agent_id: 7 },
            }),
        ]
        const result = processEvents(events)
        expect(result[0].action).toBe('initiated')
        expect(result[0].actor).toEqual({
            type: VoiceCallSubjectType.Agent,
            id: 5,
        })
        expect(result[0].target).toEqual({
            type: VoiceCallSubjectType.Agent,
            id: 7,
        })
        expect(result[0].showTransferPrefix).toBe(true)
    })

    it('sets showTransferPrefix on answered event after transfer', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallTransferInitiated, {
                meta: { target_type: 'agent', target_agent_id: 7 },
            }),
            makeEvent(PhoneIntegrationEvent.PhoneCallAnswered, { user_id: 7 }),
        ]
        const result = processEvents(events)
        expect(result[1].action).toBe('answered')
        expect(result[1].showTransferPrefix).toBe(true)
    })

    it('processes PhoneCallTransferFailed when transfer context is active', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallTransferInitiated, {
                meta: { target_type: 'agent', target_agent_id: 7 },
            }),
            makeEvent(PhoneIntegrationEvent.PhoneCallTransferFailed, {
                meta: { target_type: 'agent', target_agent_id: 7 },
            }),
        ]
        const result = processEvents(events)
        expect(result[1].action).toBe('failed')
        expect(result[1].showTransferPrefix).toBe(true)
    })

    it('ignores PhoneCallTransferFailed when no active transfer context', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallTransferFailed, {
                meta: { target_type: 'agent', target_agent_id: 7 },
            }),
        ]
        const result = processEvents(events)
        expect(result).toHaveLength(0)
    })

    it('processes PhoneCallForwardedToExternalNumber without active transfer', () => {
        const events = [
            makeEvent(
                PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber,
                {
                    meta: { external_phone_number: '+12025551234' },
                },
            ),
        ]
        const result = processEvents(events)
        expect(result[0].action).toBe('forwarded')
        expect(result[0].target).toEqual({
            type: VoiceCallSubjectType.External,
            value: '+12025551234',
            customer: undefined,
        })
    })

    it('skips PhoneCallForwardedToExternalNumber when transfer context is active', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.PhoneCallTransferInitiated, {
                meta: { target_type: 'agent', target_agent_id: 7 },
            }),
            makeEvent(
                PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber,
                {
                    meta: { external_phone_number: '+12025551234' },
                },
            ),
        ]
        const result = processEvents(events)
        expect(result).toHaveLength(1)
        expect(result[0].action).toBe('initiated')
    })

    it('processes Enqueued event', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.Enqueued, {
                meta: { queue_id: 3 },
            }),
        ]
        const result = processEvents(events)
        expect(result[0].action).toBe('added to queue')
        expect(result[0].target).toEqual({
            type: VoiceCallSubjectType.Queue,
            id: 3,
        })
    })

    it('processes Dequeued event with dequeued_reason', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.Dequeued, {
                meta: { queue_id: 3, dequeued_reason: 'agent_picked_up' },
            }),
        ]
        const result = processEvents(events)
        expect(result[0].action).toBe('removed from queue')
        expect(result[0].extra).toBe('agent picked up')
    })

    it('processes IvrOptionSelected event', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.IvrOptionSelected, {
                meta: {
                    digit_pressed: '2',
                    selected_branch_option_name: 'Sales',
                },
            }),
        ]
        const result = processEvents(events)
        expect(result[0].action).toBe('selected')
        expect(result[0].target).toEqual({
            type: VoiceCallSubjectType.IvrMenuOption,
            digit: '2',
        })
        expect(result[0].extra).toBe('Sales')
    })
})

describe('hasFlowEndEvent', () => {
    it('returns true when EndingTriggered with end-of-call-flow and no Enqueued', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.EndingTriggered, {
                meta: { ending_reason: 'end-of-call-flow' },
            }),
        ]
        expect(hasFlowEndEvent(events)).toBe(true)
    })

    it('returns false when EndingTriggered with end-of-call-flow but also Enqueued', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.EndingTriggered, {
                meta: { ending_reason: 'end-of-call-flow' },
            }),
            makeEvent(PhoneIntegrationEvent.Enqueued, {
                meta: { queue_id: 1 },
            }),
        ]
        expect(hasFlowEndEvent(events)).toBe(false)
    })

    it('returns false when no EndingTriggered event', () => {
        const events = [makeEvent(PhoneIntegrationEvent.PhoneCallAnswered)]
        expect(hasFlowEndEvent(events)).toBe(false)
    })

    it('returns false when EndingTriggered has a different ending_reason', () => {
        const events = [
            makeEvent(PhoneIntegrationEvent.EndingTriggered, {
                meta: { ending_reason: 'hangup' },
            }),
        ]
        expect(hasFlowEndEvent(events)).toBe(false)
    })
})
