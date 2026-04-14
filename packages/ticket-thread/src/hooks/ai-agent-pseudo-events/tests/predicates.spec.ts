import { mockTicketMessage } from '@gorgias/helpdesk-mocks'

import { AI_AGENT_BOT_EMAILS } from '../../messages/constants'
import type {
    TicketThreadAiAgentInternalNoteItem,
    TicketThreadAiAgentMessageItem,
    TicketThreadRegularMessageItem,
} from '../../messages/types'
import { TicketThreadItemTag } from '../../types'
import {
    isAiAgentPseudoEventMessageItem,
    shouldGroupLegacyAiAgentMessages,
} from '../predicates'

function createAiAgentMessageItem(
    overrides: Partial<TicketThreadAiAgentMessageItem['data']> = {},
): TicketThreadAiAgentMessageItem {
    const data = mockTicketMessage({
        id: 1,
        created_datetime: '2024-03-21T11:00:00Z',
        channel: 'chat',
        public: true,
        from_agent: true,
        via: 'api',
        body_html: 'hello',
        sender: {
            id: 2,
            name: 'AI Agent',
            firstname: 'AI',
            lastname: 'Agent',
            email: AI_AGENT_BOT_EMAILS[0],
            meta: null,
        },
        ...overrides,
    })

    return {
        _tag: TicketThreadItemTag.Messages.AiAgentMessage,
        data: data as TicketThreadAiAgentMessageItem['data'],
        datetime: data.created_datetime,
    }
}

function createAiAgentInternalNoteItem(
    overrides: Partial<TicketThreadAiAgentInternalNoteItem['data']> = {},
): TicketThreadAiAgentInternalNoteItem {
    const data = mockTicketMessage({
        id: 1,
        created_datetime: '2024-03-21T11:00:00Z',
        channel: 'chat',
        public: false,
        from_agent: true,
        via: 'api',
        body_html: 'hello',
        sender: {
            id: 2,
            name: 'AI Agent',
            firstname: 'AI',
            lastname: 'Agent',
            email: AI_AGENT_BOT_EMAILS[0],
            meta: null,
        },
        ...overrides,
    })

    return {
        _tag: TicketThreadItemTag.Messages.AiAgentInternalNote,
        data: data as TicketThreadAiAgentInternalNoteItem['data'],
        datetime: data.created_datetime,
    }
}

function createRegularMessageItem(
    overrides: Partial<TicketThreadRegularMessageItem['data']> = {},
): TicketThreadRegularMessageItem {
    const data = mockTicketMessage({
        id: 1,
        created_datetime: '2024-03-21T11:00:00Z',
        channel: 'email',
        public: true,
        from_agent: true,
        via: 'api',
        body_html: 'hello',
        sender: {
            id: 3,
            name: 'Alice',
            firstname: 'Alice',
            lastname: 'Doe',
            email: 'alice@example.com',
            meta: null,
        },
        ...overrides,
    })

    return {
        _tag: TicketThreadItemTag.Messages.Message,
        data: data as TicketThreadRegularMessageItem['data'],
        datetime: data.created_datetime,
    }
}

describe('isAiAgentPseudoEventMessageItem', () => {
    it('returns true for AI agent messages and internal notes', () => {
        expect(
            isAiAgentPseudoEventMessageItem(createAiAgentMessageItem()),
        ).toBe(true)
        expect(
            isAiAgentPseudoEventMessageItem(createAiAgentInternalNoteItem()),
        ).toBe(true)
    })

    it('returns false for non-AI ticket messages', () => {
        expect(
            isAiAgentPseudoEventMessageItem(createRegularMessageItem()),
        ).toBe(false)
    })

    it('returns false for non-message thread items', () => {
        expect(
            isAiAgentPseudoEventMessageItem({
                _tag: TicketThreadItemTag.Events.TicketEvent,
                datetime: '2024-03-21T11:00:00Z',
                data: { id: 42 },
            } as never),
        ).toBe(false)
    })
})

describe('shouldGroupLegacyAiAgentMessages', () => {
    it('groups eligible AI messages from the same legacy block', () => {
        const first = createAiAgentMessageItem({
            created_datetime: '2024-03-21T11:00:00Z',
        })
        const next = createAiAgentMessageItem({
            id: 2,
            created_datetime: '2024-03-21T11:04:59Z',
        })

        expect(shouldGroupLegacyAiAgentMessages(first, next)).toBe(true)
    })

    it('groups supported facebook-messenger internal notes within the legacy window', () => {
        const first = createAiAgentInternalNoteItem({
            channel: 'facebook-messenger',
            created_datetime: '2024-03-21T11:00:00Z',
        })
        const next = createAiAgentInternalNoteItem({
            id: 2,
            channel: 'facebook-messenger',
            created_datetime: '2024-03-21T11:04:00Z',
        })

        expect(shouldGroupLegacyAiAgentMessages(first, next)).toBe(true)
    })

    it('does not group when the sender/channel/public/from_agent tuple changes', () => {
        const first = createAiAgentMessageItem()

        expect(
            shouldGroupLegacyAiAgentMessages(
                first,
                createAiAgentMessageItem({
                    id: 2,
                    sender: {
                        ...first.data.sender,
                        id: 9,
                    },
                }),
            ),
        ).toBe(false)
        expect(
            shouldGroupLegacyAiAgentMessages(
                first,
                createAiAgentMessageItem({
                    id: 3,
                    channel: 'facebook-messenger',
                }),
            ),
        ).toBe(false)
        expect(
            shouldGroupLegacyAiAgentMessages(
                first,
                createAiAgentMessageItem({
                    id: 4,
                    public: false,
                }),
            ),
        ).toBe(false)
        expect(
            shouldGroupLegacyAiAgentMessages(
                first,
                createAiAgentMessageItem({
                    id: 5,
                    from_agent: false,
                }),
            ),
        ).toBe(false)
    })

    it('does not group unsupported channels or messages outside the five-minute window', () => {
        const chatMessage = createAiAgentMessageItem({
            created_datetime: '2024-03-21T11:00:00Z',
        })

        expect(
            shouldGroupLegacyAiAgentMessages(
                createAiAgentMessageItem({
                    channel: 'email',
                }),
                createAiAgentMessageItem({
                    id: 2,
                    channel: 'email',
                    created_datetime: '2024-03-21T11:01:00Z',
                }),
            ),
        ).toBe(false)
        expect(
            shouldGroupLegacyAiAgentMessages(
                chatMessage,
                createAiAgentMessageItem({
                    id: 3,
                    created_datetime: '2024-03-21T11:05:00Z',
                }),
            ),
        ).toBe(false)
    })
})
