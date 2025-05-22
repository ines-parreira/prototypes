import { TicketStatus, TicketVia } from 'business/types/ticket'
import { MacroActionName } from 'models/macroAction/types'
import { TicketEventEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'

import type { TicketElement } from '../../types'
import { aiMessageEventsTransformer } from '../aiMessageEventsTransformer'

const email = AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS[0]

describe('aiMessageEventsTransformer', () => {
    it('should not transform non-message events', () => {
        const elements = [{ type: 'event' }] as TicketElement[]
        const result = aiMessageEventsTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not transform messages that did not come via the api', () => {
        const elements = [{ type: 'message', data: {} }] as TicketElement[]
        const result = aiMessageEventsTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not transform non-AI Agent messages', () => {
        const elements = [
            { type: 'message', data: { via: TicketVia.Api, sender: {} } },
        ] as TicketElement[]
        const result = aiMessageEventsTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not transform AI Agent messages that to not have an event that needs to be injected', () => {
        const elements = [
            {
                type: 'message',
                data: { via: TicketVia.Api, sender: { email } },
            },
        ] as TicketElement[]
        const result = aiMessageEventsTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should inject close event from a message', () => {
        const elements = [
            {
                type: 'message',
                datetime: '2025-05-21T13:00:00',
                data: {
                    via: TicketVia.Api,
                    sender: { email },
                    actions: [
                        {
                            name: MacroActionName.SetStatus,
                            arguments: { status: TicketStatus.Closed },
                        },
                    ],
                },
            },
        ] as unknown as TicketElement[]
        const result = aiMessageEventsTransformer(elements)
        expect(result).toEqual([
            elements[0],
            {
                type: 'ai-event',
                datetime: elements[0].datetime,
                data: { eventType: TicketEventEnum.CLOSE },
            },
        ])
    })

    it('should inject a snooze event from a message', () => {
        const elements = [
            {
                type: 'message',
                datetime: '2025-05-21T13:00:00',
                data: {
                    via: TicketVia.Api,
                    sender: { email },
                    actions: [{ name: MacroActionName.SnoozeTicket }],
                },
            },
        ] as unknown as TicketElement[]
        const result = aiMessageEventsTransformer(elements)
        expect(result).toEqual([
            elements[0],
            {
                type: 'ai-event',
                datetime: elements[0].datetime,
                data: { eventType: TicketEventEnum.SNOOZE },
            },
        ])
    })

    it('should inject a handover event from a message', () => {
        const elements = [
            {
                type: 'message',
                datetime: '2025-05-21T13:00:00',
                data: {
                    via: TicketVia.Api,
                    sender: { email },
                    actions: [
                        {
                            name: MacroActionName.AddTags,
                            arguments: { tags: 'ai_handover' },
                        },
                    ],
                },
            },
        ] as unknown as TicketElement[]
        const result = aiMessageEventsTransformer(elements)
        expect(result).toEqual([
            elements[0],
            {
                type: 'ai-event',
                datetime: elements[0].datetime,
                data: { eventType: TicketEventEnum.HANDOVER },
            },
        ])
    })
})
