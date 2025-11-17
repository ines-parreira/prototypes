import { PhoneIntegrationEvent } from 'constants/integrations/types/event'
import type { ProcessedEvent } from 'models/voiceCall/processEvents'
import { hasFlowEndEvent, processEvents } from 'models/voiceCall/processEvents'

import type { VoiceCallEvent } from '../types'
import { VoiceCallSubjectType } from '../types'

describe('processEvents', () => {
    it('should return an empty array when passed an empty array', () => {
        const result = processEvents([])
        expect(result).toEqual([])
    })

    it('should process events of a round-robin inbound call', () => {
        const events = [
            // agent was rang but declined
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:02 AM',
                user_id: 100,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.DeclinedPhoneCall,
                created_datetime: '09:03 AM',
                user_id: 100,
                meta: {},
            },
            // agent was rang but missed
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:04 AM',
                user_id: 101,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.ChildCallNotAnswered,
                created_datetime: '09:05 AM',
                user_id: 101,
                meta: {},
            },
            // agent was rang then answered
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:06 AM',
                user_id: 102,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallAnswered,
                created_datetime: '09:07 AM',
                user_id: 102,
                meta: {},
            },
        ] as unknown as VoiceCallEvent[]
        const result = processEvents(events)
        expect(result).toEqual([
            {
                datetime: '09:03 AM',
                action: 'declined',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                showTransferPrefix: false,
            },
            {
                datetime: '09:04 AM',
                action: 'missed',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 101,
                },
                showTransferPrefix: false,
            },
            {
                datetime: '09:07 AM',
                action: 'answered',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 102,
                },
                showTransferPrefix: false,
            },
        ] as ProcessedEvent[])
    })

    it('should process events of a broadcast inbound call', () => {
        const events = [
            // all agents rang at the same time
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:02 AM',
                user_id: 100,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:02 AM',
                user_id: 101,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:02 AM',
                user_id: 102,
                meta: {},
            },
            // one declined
            {
                type: PhoneIntegrationEvent.DeclinedPhoneCall,
                created_datetime: '09:04 AM',
                user_id: 100,
                meta: {},
            },
            // one answered
            {
                type: PhoneIntegrationEvent.PhoneCallAnswered,
                created_datetime: '09:07 AM',
                user_id: 102,
                meta: {},
            },
        ] as unknown as VoiceCallEvent[]
        const result = processEvents(events)
        expect(result).toEqual([
            {
                datetime: '09:02 AM',
                action: 'missed',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 101,
                },
                showTransferPrefix: false,
            },
            {
                datetime: '09:04 AM',
                action: 'declined',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                showTransferPrefix: false,
            },
            {
                datetime: '09:07 AM',
                action: 'answered',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 102,
                },
                showTransferPrefix: false,
            },
        ] as ProcessedEvent[])
    })

    it('should process events of an outbound call', () => {
        const events = [
            {
                type: PhoneIntegrationEvent.OutgoingPhoneCallConnected,
                created_datetime: '09:02 AM',
                user_id: 138,
                customer_id: 200,
                meta: {
                    customer: {
                        id: 200,
                        name: 'Guybrush Threepwood',
                        phone_number: '+393312345678',
                    },
                },
            },
        ] as unknown as VoiceCallEvent[]
        const result = processEvents(events)
        expect(result).toEqual([
            {
                datetime: '09:02 AM',
                action: 'answered',
                actor: {
                    type: VoiceCallSubjectType.External,
                    value: '+393312345678',
                    customer: {
                        id: 200,
                        name: 'Guybrush Threepwood',
                    },
                },
            },
        ] as ProcessedEvent[])
    })

    it('should process events of an inbound call with forward to external numbers', () => {
        const events = [
            // number was rang but declined
            {
                type: PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber,
                created_datetime: '09:02 AM',
                user_id: null,
                meta: {
                    target_customer_id: 200,
                    external_number: '+393312345678',
                },
            },
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:02 AM',
                user_id: 0,
                meta: {
                    external_forwarded: true,
                    target_customer_id: 200,
                    external_phone_number: '+393312345678',
                },
            },
            {
                type: PhoneIntegrationEvent.DeclinedPhoneCall,
                created_datetime: '09:03 AM',
                user_id: 0,
                meta: {
                    external_forwarded: true,
                    target_customer_id: 200,
                    external_phone_number: '+393312345678',
                },
            },
            // number was rang but missed (no customer id)
            {
                type: PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber,
                created_datetime: '09:04 AM',
                user_id: null,
                meta: {
                    external_phone_number: '+393456789012',
                },
            },
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:04 AM',
                user_id: 0,
                meta: {
                    external_forwarded: true,
                    external_phone_number: '+393456789012',
                },
            },
            {
                type: PhoneIntegrationEvent.ChildCallNotAnswered,
                created_datetime: '09:05 AM',
                user_id: 0,
                meta: {
                    external_forwarded: true,
                    external_phone_number: '+393456789012',
                },
            },
            // number was rang then answered
            {
                type: PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber,
                created_datetime: '09:06 AM',
                user_id: null,
                meta: {
                    target_customer_id: 202,
                    external_number: '+393924567890',
                },
            },
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:06 AM',
                user_id: 0,
                meta: {
                    external_forwarded: true,
                    target_customer_id: 202,
                    external_phone_number: '+393924567890',
                },
            },
            {
                type: PhoneIntegrationEvent.PhoneCallAnswered,
                created_datetime: '09:07 AM',
                user_id: 0,
                meta: {
                    external_forwarded: true,
                    target_customer_id: 202,
                    external_phone_number: '+393924567890',
                },
            },
        ] as unknown as VoiceCallEvent[]
        const result = processEvents(events)
        expect(result).toEqual([
            {
                datetime: '09:02 AM',
                action: 'forwarded',
                target: {
                    type: VoiceCallSubjectType.External,
                    value: '+393312345678',
                    customer: {
                        id: 200,
                    },
                },
            },
            {
                datetime: '09:03 AM',
                action: 'declined',
                actor: {
                    type: VoiceCallSubjectType.External,
                    value: '+393312345678',
                    customer: {
                        id: 200,
                    },
                },
                showTransferPrefix: false,
            },
            {
                datetime: '09:04 AM',
                action: 'forwarded',
                target: {
                    type: VoiceCallSubjectType.External,
                    value: '+393456789012',
                    customer: undefined,
                },
            },
            {
                datetime: '09:04 AM',
                action: 'missed',
                actor: {
                    type: VoiceCallSubjectType.External,
                    value: '+393456789012',
                    customer: undefined,
                },
                showTransferPrefix: false,
            },
            {
                datetime: '09:06 AM',
                action: 'forwarded',
                target: {
                    type: VoiceCallSubjectType.External,
                    value: '+393924567890',
                    customer: {
                        id: 202,
                    },
                },
            },
            {
                datetime: '09:07 AM',
                action: 'answered',
                actor: {
                    type: VoiceCallSubjectType.External,
                    value: '+393924567890',
                    customer: {
                        id: 202,
                    },
                },
                showTransferPrefix: false,
            },
        ] as ProcessedEvent[])
    })

    it('should process events of an inbound call with transfers', () => {
        const events = [
            // call was answered
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:02 AM',
                user_id: 100,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallAnswered,
                created_datetime: '09:05 AM',
                user_id: 100,
                meta: {},
            },
            // transfer failed
            {
                type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                created_datetime: '09:06 AM',
                user_id: 100,
                meta: {
                    target_type: 'agent',
                    source_agent_id: 100,
                    target_agent_id: 101,
                },
            },
            {
                type: PhoneIntegrationEvent.PhoneCallTransferFailed,
                created_datetime: '09:07 AM',
                user_id: 101,
                meta: {
                    target_type: 'agent',
                    source_agent_id: 100,
                    target_agent_id: 101,
                },
            },
            // transfer declined
            {
                type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                created_datetime: '09:08 AM',
                user_id: 100,
                meta: {
                    target_type: 'agent',
                    source_agent_id: 100,
                    target_agent_id: 102,
                },
            },
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:09 AM',
                user_id: 102,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.DeclinedPhoneCall,
                created_datetime: '09:10 AM',
                user_id: 102,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallTransferFailed,
                created_datetime: '09:10 AM',
                user_id: 102,
                meta: {
                    target_type: 'agent',
                    source_agent_id: 100,
                    target_agent_id: 102,
                },
            },
            // transfer missed
            {
                type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                created_datetime: '09:11 AM',
                user_id: 100,
                meta: {
                    target_type: 'agent',
                    source_agent_id: 100,
                    target_agent_id: 103,
                },
            },
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:12 AM',
                user_id: 103,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.ChildCallNotAnswered,
                created_datetime: '09:13 AM',
                user_id: 104,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallTransferFailed,
                created_datetime: '09:13 AM',
                user_id: 103,
                meta: {
                    target_type: 'agent',
                    source_agent_id: 100,
                    target_agent_id: 103,
                },
            },
            // transfer answered
            {
                type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                created_datetime: '09:14 AM',
                user_id: 100,
                meta: {
                    target_type: 'agent',
                    source_agent_id: 100,
                    target_agent_id: 104,
                },
            },
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:15 AM',
                user_id: 104,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallAnswered,
                created_datetime: '09:16 AM',
                user_id: 104,
                meta: {},
            },
            // transfer answered by external number
            // should skip the PhoneCallForwardedToExternalNumber event
            {
                type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                created_datetime: '09:17 AM',
                user_id: 100,
                meta: {
                    target_type: 'external',
                    source_agent_id: 100,
                    target_external_number: '+393924567890',
                    target_customer_id: 200,
                },
            },
            {
                type: PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber,
                created_datetime: '09:18 AM',
                user_id: null,
                meta: {
                    target_customer_id: 200,
                    external_number: '+393924567890',
                },
            },
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:19 AM',
                user_id: 0,
                meta: {
                    external_forwarded: true,
                    target_customer_id: 200,
                    external_phone_number: '+393924567890',
                },
            },
            {
                type: PhoneIntegrationEvent.PhoneCallAnswered,
                created_datetime: '09:20 AM',
                user_id: 0,
                meta: {
                    external_forwarded: true,
                    target_customer_id: 200,
                    external_phone_number: '+393924567890',
                },
            },
        ] as unknown as VoiceCallEvent[]
        const result = processEvents(events)
        expect(result).toEqual([
            {
                datetime: '09:05 AM',
                action: 'answered',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                showTransferPrefix: false,
            },
            {
                datetime: '09:06 AM',
                action: 'initiated',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                target: {
                    type: VoiceCallSubjectType.Agent,
                    id: 101,
                },
                showTransferPrefix: true,
            },
            {
                datetime: '09:07 AM',
                action: 'failed',
                target: {
                    type: VoiceCallSubjectType.Agent,
                    id: 101,
                },
                showTransferPrefix: true,
            },
            {
                datetime: '09:08 AM',
                action: 'initiated',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                target: {
                    type: VoiceCallSubjectType.Agent,
                    id: 102,
                },
                showTransferPrefix: true,
            },
            {
                datetime: '09:10 AM',
                action: 'declined',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 102,
                },
                showTransferPrefix: true,
            },
            {
                datetime: '09:11 AM',
                action: 'initiated',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                target: {
                    type: VoiceCallSubjectType.Agent,
                    id: 103,
                },
                showTransferPrefix: true,
            },
            {
                datetime: '09:12 AM',
                action: 'missed',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 103,
                },
                showTransferPrefix: true,
            },
            {
                datetime: '09:14 AM',
                action: 'initiated',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                target: {
                    type: VoiceCallSubjectType.Agent,
                    id: 104,
                },
                showTransferPrefix: true,
            },
            {
                datetime: '09:16 AM',
                action: 'answered',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 104,
                },
                showTransferPrefix: true,
            },
            {
                datetime: '09:17 AM',
                action: 'initiated',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                target: {
                    type: VoiceCallSubjectType.External,
                    value: '+393924567890',
                    customer: {
                        id: 200,
                    },
                },
                showTransferPrefix: true,
            },
            {
                datetime: '09:20 AM',
                action: 'answered',
                actor: {
                    type: VoiceCallSubjectType.External,
                    value: '+393924567890',
                    customer: {
                        id: 200,
                    },
                },
                showTransferPrefix: true,
            },
        ] as ProcessedEvent[])
    })

    it('should process events of an inbound call with ongoing ringing', () => {
        const events = [
            // call was answered
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:02 AM',
                user_id: 100,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.DeclinedPhoneCall,
                created_datetime: '09:05 AM',
                user_id: 100,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:09 AM',
                user_id: 102,
                meta: {},
            },
        ] as unknown as VoiceCallEvent[]
        const result = processEvents(events)
        expect(result).toEqual([
            {
                datetime: '09:05 AM',
                action: 'declined',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                showTransferPrefix: false,
            },
        ] as ProcessedEvent[])
    })

    it('should process events of a call with queue transfers', () => {
        const events = [
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:00 AM',
                user_id: 100,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallAnswered,
                created_datetime: '09:01 AM',
                user_id: 100,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                created_datetime: '09:05 AM',
                user_id: 100,
                meta: {
                    target_type: 'queue',
                    source_agent_id: 100,
                    target_queue_id: 500,
                },
            },
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:07 AM',
                user_id: 101,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.DeclinedPhoneCall,
                created_datetime: '09:08 AM',
                user_id: 101,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:09 AM',
                user_id: 102,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallAnswered,
                created_datetime: '09:10 AM',
                user_id: 102,
                meta: {},
            },
        ] as unknown as VoiceCallEvent[]
        const result = processEvents(events)
        expect(result).toEqual([
            {
                datetime: '09:01 AM',
                action: 'answered',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                showTransferPrefix: false,
            },
            {
                datetime: '09:05 AM',
                action: 'initiated',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                target: {
                    type: VoiceCallSubjectType.Queue,
                    id: 500,
                },
                showTransferPrefix: true,
            },
            {
                datetime: '09:08 AM',
                action: 'declined',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 101,
                },
                showTransferPrefix: false,
            },
            {
                datetime: '09:10 AM',
                action: 'answered',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 102,
                },
                showTransferPrefix: false,
            },
        ] as ProcessedEvent[])
    })

    it('should process events of a call with failed transfer to external number', () => {
        const events = [
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:00 AM',
                user_id: 100,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallAnswered,
                created_datetime: '09:01 AM',
                user_id: 100,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                created_datetime: '09:05 AM',
                user_id: 100,
                meta: {
                    source_agent_id: 100,
                    target_type: 'external',
                    target_external_number: '+393924567890',
                },
            },
            {
                type: PhoneIntegrationEvent.PhoneCallTransferFailed,
                created_datetime: '09:08 AM',
                user_id: 101,
                meta: {
                    source_agent_id: 100,
                    target_type: 'external',
                    target: '+393924567890',
                },
            },
        ] as unknown as VoiceCallEvent[]
        const result = processEvents(events)
        expect(result).toEqual([
            {
                datetime: '09:01 AM',
                action: 'answered',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                showTransferPrefix: false,
            },
            {
                datetime: '09:05 AM',
                action: 'initiated',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                target: {
                    type: VoiceCallSubjectType.External,
                    value: '+393924567890',
                },
                showTransferPrefix: true,
            },
            {
                datetime: '09:08 AM',
                action: 'failed',
                target: {
                    type: VoiceCallSubjectType.External,
                    value: '+393924567890',
                },
                showTransferPrefix: true,
            },
        ] as ProcessedEvent[])
    })

    it('should process events of a call with failed transfer to queue', () => {
        const events = [
            {
                type: PhoneIntegrationEvent.PhoneCallRinging,
                created_datetime: '09:00 AM',
                user_id: 100,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallAnswered,
                created_datetime: '09:01 AM',
                user_id: 100,
                meta: {},
            },
            {
                type: PhoneIntegrationEvent.PhoneCallTransferInitiated,
                created_datetime: '09:05 AM',
                user_id: 100,
                meta: {
                    source_agent_id: 100,
                    target_type: 'queue',
                    target_queue_id: 500,
                },
            },
            {
                type: PhoneIntegrationEvent.PhoneCallTransferFailed,
                created_datetime: '09:08 AM',
                user_id: 101,
                meta: {
                    source_agent_id: 100,
                    target_type: 'queue',
                    target_queue_id: 500,
                },
            },
        ] as unknown as VoiceCallEvent[]
        const result = processEvents(events)
        expect(result).toEqual([
            {
                datetime: '09:01 AM',
                action: 'answered',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                showTransferPrefix: false,
            },
            {
                datetime: '09:05 AM',
                action: 'initiated',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                target: {
                    type: VoiceCallSubjectType.Queue,
                    id: 500,
                },
                showTransferPrefix: true,
            },
            {
                datetime: '09:08 AM',
                action: 'failed',
                target: {
                    type: VoiceCallSubjectType.Queue,
                    id: 500,
                },
                showTransferPrefix: true,
            },
        ] as ProcessedEvent[])
    })

    it('should process queue events with queue target', () => {
        const mockEvents: VoiceCallEvent[] = [
            {
                id: 1,
                type: PhoneIntegrationEvent.Enqueued,
                account_id: 100,
                call_id: 200,
                user_id: null,
                customer_id: 300,
                created_datetime: '2024-01-15T10:30:00Z',
                meta: {
                    queue_id: 42,
                },
            },
            {
                id: 1,
                type: PhoneIntegrationEvent.Dequeued,
                account_id: 100,
                call_id: 200,
                user_id: null,
                customer_id: 300,
                created_datetime: '2024-01-15T10:35:00Z',
                meta: {
                    queue_id: 42,
                    dequeued_reason: 'call_timeout',
                },
            },
        ]

        const result = processEvents(mockEvents)

        expect(result).toEqual([
            {
                datetime: '2024-01-15T10:30:00Z',
                action: 'added to queue',
                target: {
                    type: VoiceCallSubjectType.Queue,
                    id: 42,
                },
                connector: ' ',
            },
            {
                datetime: '2024-01-15T10:35:00Z',
                action: 'removed from queue',
                target: {
                    type: VoiceCallSubjectType.Queue,
                    id: 42,
                },
                connector: ' ',
                extra: 'call timeout',
            },
        ])
    })

    it('should process IVR option selected events', () => {
        const mockEvents: VoiceCallEvent[] = [
            {
                id: 1,
                type: PhoneIntegrationEvent.IvrOptionSelected,
                account_id: 100,
                call_id: 200,
                user_id: null,
                customer_id: 300,
                created_datetime: '2024-01-15T10:32:00Z',
                meta: {
                    digit_pressed: '1',
                    selected_branch_option_name: 'Sales Department',
                },
            },
            {
                id: 2,
                type: PhoneIntegrationEvent.IvrOptionSelected,
                account_id: 100,
                call_id: 200,
                user_id: null,
                customer_id: 300,
                created_datetime: '2024-01-15T10:33:00Z',
                meta: {
                    digit_pressed: '3',
                },
            },
        ]

        const result = processEvents(mockEvents)

        expect(result).toEqual([
            {
                datetime: '2024-01-15T10:32:00Z',
                action: 'selected',
                connector: ' ',
                target: {
                    type: VoiceCallSubjectType.IvrMenuOption,
                    digit: '1',
                },
                extra: 'Sales Department',
            },
            {
                datetime: '2024-01-15T10:33:00Z',
                action: 'selected',
                connector: ' ',
                target: {
                    type: VoiceCallSubjectType.IvrMenuOption,
                    digit: '3',
                },
                extra: undefined,
            },
        ])
    })
})

describe('hasFlowEndEvent', () => {
    const createEvent = (
        type: PhoneIntegrationEvent,
        meta: Record<string, unknown> = {},
    ): VoiceCallEvent => ({
        id: 1,
        type,
        account_id: 1,
        call_id: 1,
        user_id: null,
        customer_id: 1,
        created_datetime: '2025-01-01T10:00:00Z',
        meta,
    })

    it('should return false when events array is empty', () => {
        expect(hasFlowEndEvent([])).toBe(false)
    })

    it('should return false when there is no EndingTriggered event', () => {
        const events = [
            createEvent(PhoneIntegrationEvent.PhoneCallAnswered),
            createEvent(PhoneIntegrationEvent.CompletedPhoneCall),
        ]

        expect(hasFlowEndEvent(events)).toBe(false)
    })

    it('should return false when EndingTriggered event exists but ending_reason is not end-of-call-flow', () => {
        const events = [
            createEvent(PhoneIntegrationEvent.EndingTriggered, {
                ending_reason: 'agent-hung-up',
            }),
        ]

        expect(hasFlowEndEvent(events)).toBe(false)
    })

    it('should return false when EndingTriggered event exists with end-of-call-flow but Enqueued event also exists', () => {
        const events = [
            createEvent(PhoneIntegrationEvent.Enqueued),
            createEvent(PhoneIntegrationEvent.EndingTriggered, {
                ending_reason: 'end-of-call-flow',
            }),
        ]

        expect(hasFlowEndEvent(events)).toBe(false)
    })

    it('should return true when EndingTriggered event exists with end-of-call-flow and no Enqueued event', () => {
        const events = [
            createEvent(PhoneIntegrationEvent.EndingTriggered, {
                ending_reason: 'end-of-call-flow',
            }),
        ]

        expect(hasFlowEndEvent(events)).toBe(true)
    })

    it('should return false when EndingTriggered has no ending_reason in meta', () => {
        const events = [
            createEvent(PhoneIntegrationEvent.EndingTriggered, {}),
            createEvent(PhoneIntegrationEvent.PhoneCallAnswered),
        ]

        expect(hasFlowEndEvent(events)).toBe(false)
    })
})
