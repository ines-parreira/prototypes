import { mockTicketMessage, mockTicketTag } from '@gorgias/helpdesk-mocks'
import { TicketStatus } from '@gorgias/helpdesk-queries'
import type { TicketMessage } from '@gorgias/helpdesk-queries'

import {
    AI_AGENT_BOT_EMAILS,
    AI_AGENT_DRAFT_MESSAGE_TAG,
} from '../../messages/constants'
import type {
    TicketThreadAiAgentDraftMessageItem,
    TicketThreadAiAgentInternalNoteItem,
    TicketThreadAiAgentMessageItem,
    TicketThreadMessageItem,
} from '../../messages/types'
import type { TicketThreadItem } from '../../types'
import { TicketThreadItemTag } from '../../types'
import {
    decorateMessagesWithAiAgentPseudoEvents,
    findAndSplitMessageTags,
    getAiAgentPseudoEventFromMessage,
} from '../transforms'
import type { TicketThreadAiAgentPseudoEvent } from '../types'
import { TicketThreadAiAgentPseudoEventAction } from '../types'

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

function createAiAgentDraftMessageItem(
    overrides: Partial<TicketThreadAiAgentDraftMessageItem['data']> = {},
): TicketThreadAiAgentDraftMessageItem {
    const data = mockTicketMessage({
        id: 1,
        created_datetime: '2024-03-21T11:00:00Z',
        channel: 'chat',
        public: true,
        from_agent: true,
        via: 'api',
        body_html: AI_AGENT_DRAFT_MESSAGE_TAG,
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
        _tag: TicketThreadItemTag.Messages.AiAgentDraftMessage,
        data: data as TicketThreadAiAgentDraftMessageItem['data'],
        datetime: data.created_datetime,
    }
}

function createEventItem(datetime: string): TicketThreadItem {
    return {
        _tag: TicketThreadItemTag.Events.TicketEvent,
        datetime,
        data: { id: Number(datetime.replace(/\D/g, '').slice(-6)) },
    } as TicketThreadItem
}

function createPseudoEvent(
    action: TicketThreadAiAgentPseudoEvent['action'],
): TicketThreadAiAgentPseudoEvent {
    return {
        action,
        tags: [],
    }
}

describe('findAndSplitMessageTags', () => {
    it('returns an empty array when actions are missing', () => {
        expect(findAndSplitMessageTags(null)).toEqual([])
    })

    it('returns tag names when the addTags action is present', () => {
        expect(
            findAndSplitMessageTags([
                { name: 'someOtherAction' },
                {
                    name: 'addTags',
                    arguments: { tags: 'tag1,tag2,tag3' },
                },
            ]),
        ).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('returns an empty array when addTags is missing', () => {
        expect(findAndSplitMessageTags([{ name: 'someOtherAction' }])).toEqual(
            [],
        )
    })

    it('returns an empty array when addTags has no tags argument', () => {
        expect(
            findAndSplitMessageTags([{ name: 'addTags', arguments: {} }]),
        ).toEqual([])
    })

    it('trims spaces and drops empty values', () => {
        expect(
            findAndSplitMessageTags([
                {
                    name: 'addTags',
                    arguments: { tags: ', tag1 , , tag2 ,, ' },
                },
            ]),
        ).toEqual(['tag1', 'tag2'])
    })
})

describe('getAiAgentPseudoEventFromMessage', () => {
    it('resolves visible tags from ticket tags', () => {
        const tag1 = mockTicketTag({ id: 1, name: 'tag1', decoration: null })
        const tag2 = mockTicketTag({
            id: 2,
            name: 'tag2',
            decoration: { color: 'red' },
        })
        const message = mockTicketMessage({
            actions: [
                {
                    name: 'addTags',
                    arguments: { tags: 'tag1,tag2' },
                },
            ],
        }) as TicketMessage

        expect(getAiAgentPseudoEventFromMessage([tag1, tag2], message)).toEqual(
            {
                tags: [tag1, tag2],
                action: null,
            },
        )
    })

    it('returns the close action', () => {
        const message = mockTicketMessage({
            actions: [
                {
                    name: 'setStatus',
                    arguments: { status: TicketStatus.Closed },
                },
            ],
        }) as TicketMessage

        expect(getAiAgentPseudoEventFromMessage([], message)).toEqual({
            tags: [],
            action: TicketThreadAiAgentPseudoEventAction.Close,
        })
    })

    it('returns the handover action from raw message tags', () => {
        const message = mockTicketMessage({
            actions: [
                {
                    name: 'addTags',
                    arguments: { tags: 'ai_handover' },
                },
            ],
        }) as TicketMessage

        expect(getAiAgentPseudoEventFromMessage([], message)).toEqual({
            tags: [],
            action: TicketThreadAiAgentPseudoEventAction.Handover,
        })
    })

    it('returns the snooze action', () => {
        const message = mockTicketMessage({
            actions: [{ name: 'snoozeTicket' }],
        }) as TicketMessage

        expect(getAiAgentPseudoEventFromMessage([], message)).toEqual({
            tags: [],
            action: TicketThreadAiAgentPseudoEventAction.Snooze,
        })
    })

    it('filters ai_ tags out of the visible tag list', () => {
        const aiTag = mockTicketTag({ id: 1, name: 'ai_handover' })
        const visibleTag = mockTicketTag({ id: 2, name: 'customer-follow-up' })
        const message = mockTicketMessage({
            actions: [
                {
                    name: 'addTags',
                    arguments: { tags: 'ai_handover,customer-follow-up' },
                },
            ],
        }) as TicketMessage

        expect(
            getAiAgentPseudoEventFromMessage([aiTag, visibleTag], message),
        ).toEqual({
            tags: [visibleTag],
            action: TicketThreadAiAgentPseudoEventAction.Handover,
        })
    })

    it('prefers close over snooze and handover', () => {
        const visibleTag = mockTicketTag({ id: 2, name: 'customer-follow-up' })
        const message = mockTicketMessage({
            actions: [
                { name: 'snoozeTicket' },
                {
                    name: 'setStatus',
                    arguments: { status: TicketStatus.Closed },
                },
                {
                    name: 'addTags',
                    arguments: { tags: 'ai_handover,customer-follow-up' },
                },
            ],
        }) as TicketMessage

        expect(getAiAgentPseudoEventFromMessage([visibleTag], message)).toEqual(
            {
                tags: [visibleTag],
                action: TicketThreadAiAgentPseudoEventAction.Close,
            },
        )
    })

    it('keeps unmatched visible tag names as plain pseudo-event tags', () => {
        const message = mockTicketMessage({
            actions: [
                {
                    name: 'addTags',
                    arguments: { tags: 'customer-follow-up' },
                },
            ],
        }) as TicketMessage

        expect(getAiAgentPseudoEventFromMessage([], message)).toEqual({
            tags: [{ name: 'customer-follow-up', decoration: null }],
            action: null,
        })
    })

    it('ignores malformed action payloads', () => {
        const message = mockTicketMessage({
            actions: [
                { foo: 'bar' },
                { name: 12 },
                {
                    name: 'addTags',
                    arguments: {
                        tags: ['customer-follow-up'],
                    },
                },
                {
                    name: 'setStatus',
                    arguments: 'closed',
                },
            ] as unknown as TicketMessage['actions'],
        }) as TicketMessage

        expect(getAiAgentPseudoEventFromMessage([], message)).toEqual({
            tags: [],
            action: null,
        })
    })

    it('returns an empty pseudo-event when the message has no actions', () => {
        const message = mockTicketMessage({
            actions: null,
        }) as TicketMessage

        expect(getAiAgentPseudoEventFromMessage([], message)).toEqual({
            tags: [],
            action: null,
        })
    })
})

describe('decorateMessagesWithAiAgentPseudoEvents', () => {
    it('returns the original messages when there are no pseudo-events to attach', () => {
        const message = createAiAgentMessageItem({
            id: 1,
            created_datetime: '2024-03-21T11:00:00Z',
        })

        expect(
            decorateMessagesWithAiAgentPseudoEvents({
                messages: [message],
                persistedItems: [message],
                pseudoEventsBySourceMessageId: new Map(),
                showTicketEvents: false,
            }),
        ).toEqual([message])
    })

    it('attaches pseudo-events to the last visible AI item in each block', () => {
        const firstBlockFirst = createAiAgentMessageItem({
            id: 1,
            created_datetime: '2024-03-21T11:00:00Z',
        })
        const firstBlockLast = createAiAgentMessageItem({
            id: 2,
            created_datetime: '2024-03-21T11:02:00Z',
        })
        const secondBlockItem = createAiAgentInternalNoteItem({
            id: 3,
            created_datetime: '2024-03-21T11:04:00Z',
        })
        const persistedItems = [
            firstBlockFirst,
            firstBlockLast,
            createEventItem('2024-03-21T11:03:00Z'),
            secondBlockItem,
        ]

        const result = decorateMessagesWithAiAgentPseudoEvents({
            messages: [
                firstBlockFirst,
                firstBlockLast,
                secondBlockItem,
            ] as TicketThreadMessageItem[],
            persistedItems,
            pseudoEventsBySourceMessageId: new Map([
                [
                    2,
                    createPseudoEvent(
                        TicketThreadAiAgentPseudoEventAction.Close,
                    ),
                ],
                [
                    3,
                    createPseudoEvent(
                        TicketThreadAiAgentPseudoEventAction.Snooze,
                    ),
                ],
            ]),
            showTicketEvents: false,
        })

        expect(result[0]).not.toHaveProperty(
            'data.decorations.aiAgentPseudoEvent',
        )
        expect(result[1]).toHaveProperty(
            'data.decorations.aiAgentPseudoEvent.action',
            'close',
        )
        expect(result[2]).toHaveProperty(
            'data.decorations.aiAgentPseudoEvent.action',
            'snooze',
        )
    })

    it('skips blocks without an api source message', () => {
        const message = createAiAgentMessageItem({
            id: 1,
            created_datetime: '2024-03-21T11:00:00Z',
            via: 'gorgias_chat',
        })

        expect(
            decorateMessagesWithAiAgentPseudoEvents({
                messages: [message],
                persistedItems: [message],
                pseudoEventsBySourceMessageId: new Map([
                    [
                        1,
                        createPseudoEvent(
                            TicketThreadAiAgentPseudoEventAction.Close,
                        ),
                    ],
                ]),
                showTicketEvents: false,
            }),
        ).toEqual([message])
    })

    it('uses the last api message in a block as the source but decorates the last visible AI item', () => {
        const sourceMessage = createAiAgentMessageItem({
            id: 1,
            created_datetime: '2024-03-21T11:00:00Z',
            via: 'api',
        })
        const lastVisibleItem = createAiAgentMessageItem({
            id: 2,
            created_datetime: '2024-03-21T11:02:00Z',
            via: 'gorgias_chat',
        })

        const result = decorateMessagesWithAiAgentPseudoEvents({
            messages: [sourceMessage, lastVisibleItem],
            persistedItems: [sourceMessage, lastVisibleItem],
            pseudoEventsBySourceMessageId: new Map([
                [
                    1,
                    createPseudoEvent(
                        TicketThreadAiAgentPseudoEventAction.Handover,
                    ),
                ],
            ]),
            showTicketEvents: false,
        })

        expect(result[0]).not.toHaveProperty(
            'data.decorations.aiAgentPseudoEvent',
        )
        expect(result[1]).toHaveProperty(
            'data.decorations.aiAgentPseudoEvent.action',
            'handover',
        )
    })

    it('does not attach pseudo-events when ticket events are visible', () => {
        const message = createAiAgentMessageItem({
            id: 1,
            created_datetime: '2024-03-21T11:00:00Z',
        })

        const result = decorateMessagesWithAiAgentPseudoEvents({
            messages: [message],
            persistedItems: [message],
            pseudoEventsBySourceMessageId: new Map([
                [
                    1,
                    createPseudoEvent(
                        TicketThreadAiAgentPseudoEventAction.Close,
                    ),
                ],
            ]),
            showTicketEvents: true,
        })

        expect(result[0]).not.toHaveProperty(
            'data.decorations.aiAgentPseudoEvent',
        )
    })

    it('skips pseudo-events whose source or anchor ids are not numeric', () => {
        const invalidIdMessage = createAiAgentMessageItem({
            id: 'not-a-number' as never,
            created_datetime: '2024-03-21T11:00:00Z',
        })

        expect(
            decorateMessagesWithAiAgentPseudoEvents({
                messages: [invalidIdMessage],
                persistedItems: [invalidIdMessage],
                pseudoEventsBySourceMessageId: new Map([
                    [
                        1,
                        createPseudoEvent(
                            TicketThreadAiAgentPseudoEventAction.Close,
                        ),
                    ],
                ]),
                showTicketEvents: false,
            }),
        ).toEqual([invalidIdMessage])
    })

    it('skips attaching empty pseudo-events', () => {
        const message = createAiAgentMessageItem({
            id: 1,
            created_datetime: '2024-03-21T11:00:00Z',
        })

        expect(
            decorateMessagesWithAiAgentPseudoEvents({
                messages: [message],
                persistedItems: [message],
                pseudoEventsBySourceMessageId: new Map([
                    [
                        1,
                        {
                            action: null,
                            tags: [],
                        },
                    ],
                ]),
                showTicketEvents: false,
            }),
        ).toEqual([message])
    })

    it('treats AI draft messages as block separators and never attaches to them', () => {
        const firstMessage = createAiAgentMessageItem({
            id: 1,
            created_datetime: '2024-03-21T11:00:00Z',
        })
        const draftMessage = createAiAgentDraftMessageItem({
            id: 2,
            created_datetime: '2024-03-21T11:01:00Z',
        })
        const secondMessage = createAiAgentMessageItem({
            id: 3,
            created_datetime: '2024-03-21T11:02:00Z',
        })

        const result = decorateMessagesWithAiAgentPseudoEvents({
            messages: [
                firstMessage,
                draftMessage,
                secondMessage,
            ] as TicketThreadMessageItem[],
            persistedItems: [firstMessage, draftMessage, secondMessage],
            pseudoEventsBySourceMessageId: new Map([
                [
                    1,
                    createPseudoEvent(
                        TicketThreadAiAgentPseudoEventAction.Close,
                    ),
                ],
                [
                    3,
                    createPseudoEvent(
                        TicketThreadAiAgentPseudoEventAction.Snooze,
                    ),
                ],
            ]),
            showTicketEvents: false,
        })

        expect(result[0]).toHaveProperty(
            'data.decorations.aiAgentPseudoEvent.action',
            'close',
        )
        expect(result[1]).not.toHaveProperty(
            'data.decorations.aiAgentPseudoEvent',
        )
        expect(result[2]).toHaveProperty(
            'data.decorations.aiAgentPseudoEvent.action',
            'snooze',
        )
    })

    it('starts a new block when consecutive AI messages stop matching legacy grouping rules', () => {
        const firstMessage = createAiAgentMessageItem({
            id: 1,
            created_datetime: '2024-03-21T11:00:00Z',
            channel: 'chat',
        })
        const secondMessage = createAiAgentMessageItem({
            id: 2,
            created_datetime: '2024-03-21T11:01:00Z',
            channel: 'facebook-messenger',
        })

        const result = decorateMessagesWithAiAgentPseudoEvents({
            messages: [
                firstMessage,
                secondMessage,
            ] as TicketThreadMessageItem[],
            persistedItems: [firstMessage, secondMessage],
            pseudoEventsBySourceMessageId: new Map([
                [
                    1,
                    createPseudoEvent(
                        TicketThreadAiAgentPseudoEventAction.Close,
                    ),
                ],
                [
                    2,
                    createPseudoEvent(
                        TicketThreadAiAgentPseudoEventAction.Handover,
                    ),
                ],
            ]),
            showTicketEvents: false,
        })

        expect(result[0]).toHaveProperty(
            'data.decorations.aiAgentPseudoEvent.action',
            'close',
        )
        expect(result[1]).toHaveProperty(
            'data.decorations.aiAgentPseudoEvent.action',
            'handover',
        )
    })

    it('returns the original messages when no attachable pseudo-event survives block scanning', () => {
        const message = createAiAgentMessageItem({
            id: 1,
            via: 'gorgias_chat',
        })

        const result = decorateMessagesWithAiAgentPseudoEvents({
            messages: [message],
            persistedItems: [message],
            pseudoEventsBySourceMessageId: new Map([
                [
                    1,
                    createPseudoEvent(
                        TicketThreadAiAgentPseudoEventAction.Close,
                    ),
                ],
            ]),
            showTicketEvents: false,
        })

        expect(result).toEqual([message])
    })

    it('safely skips empty blocks before the first AI message', () => {
        const message = createAiAgentMessageItem({
            id: 1,
            created_datetime: '2024-03-21T11:01:00Z',
        })

        const result = decorateMessagesWithAiAgentPseudoEvents({
            messages: [message],
            persistedItems: [createEventItem('2024-03-21T11:00:00Z'), message],
            pseudoEventsBySourceMessageId: new Map([
                [
                    1,
                    createPseudoEvent(
                        TicketThreadAiAgentPseudoEventAction.Close,
                    ),
                ],
            ]),
            showTicketEvents: false,
        })

        expect(result[0]).toHaveProperty(
            'data.decorations.aiAgentPseudoEvent.action',
            'close',
        )
    })

    it('skips attaching empty pseudo-events', () => {
        const message = createAiAgentMessageItem({
            id: 1,
        })

        const result = decorateMessagesWithAiAgentPseudoEvents({
            messages: [message],
            persistedItems: [message],
            pseudoEventsBySourceMessageId: new Map([
                [
                    1,
                    {
                        action: null,
                        tags: [],
                    },
                ],
            ]),
            showTicketEvents: false,
        })

        expect(result).toEqual([message])
    })
})
