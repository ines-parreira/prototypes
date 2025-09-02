import { PhoneIntegrationEvent } from 'constants/integrations/types/event'
import { ProcessedEvent, processEvents } from 'models/voiceCall/processEvents'

import { VoiceCallEvent, VoiceCallSubjectType } from '../types'

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
                happensDuringTransfer: false,
            },
            {
                datetime: '09:04 AM',
                action: 'missed',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 101,
                },
                happensDuringTransfer: false,
            },
            {
                datetime: '09:07 AM',
                action: 'answered',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 102,
                },
                happensDuringTransfer: false,
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
                happensDuringTransfer: false,
            },
            {
                datetime: '09:04 AM',
                action: 'declined',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 100,
                },
                happensDuringTransfer: false,
            },
            {
                datetime: '09:07 AM',
                action: 'answered',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 102,
                },
                happensDuringTransfer: false,
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
                happensDuringTransfer: false,
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
                happensDuringTransfer: false,
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
                happensDuringTransfer: false,
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
                happensDuringTransfer: false,
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
                happensDuringTransfer: true,
            },
            {
                datetime: '09:07 AM',
                action: 'failed',
                target: {
                    type: VoiceCallSubjectType.Agent,
                    id: 101,
                },
                happensDuringTransfer: true,
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
                happensDuringTransfer: true,
            },
            {
                datetime: '09:10 AM',
                action: 'declined',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 102,
                },
                happensDuringTransfer: true,
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
                happensDuringTransfer: true,
            },
            {
                datetime: '09:12 AM',
                action: 'missed',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 103,
                },
                happensDuringTransfer: true,
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
                happensDuringTransfer: true,
            },
            {
                datetime: '09:16 AM',
                action: 'answered',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 104,
                },
                happensDuringTransfer: true,
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
                happensDuringTransfer: true,
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
                happensDuringTransfer: true,
            },
        ] as ProcessedEvent[])
    })

    it('should process events of an inbound call with ongoing transfer', () => {
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

            // transfer in progress
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
                happensDuringTransfer: false,
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
                happensDuringTransfer: true,
            },
        ] as ProcessedEvent[])
    })
})
