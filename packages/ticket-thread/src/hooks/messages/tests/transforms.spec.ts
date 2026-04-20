import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { TicketThreadItemTag } from '../../types'
import {
    AI_AGENT_DRAFT_MESSAGE_TAG,
    AI_AGENT_TRIAL_MESSAGE_TAG,
} from '../constants'
import { groupConsecutiveMessages, toTaggedMessage } from '../transforms'
import { TicketThreadPendingState } from '../types'
import type { TicketThreadMessageData } from '../types'

type TicketMessageSender = NonNullable<TicketMessage['sender']>

function createSender(
    overrides: Partial<TicketMessageSender> = {},
): TicketMessageSender {
    return {
        id: 10,
        email: 'customer@gorgias.com',
        name: 'Customer',
        firstname: 'Customer',
        lastname: '',
        meta: {},
        ...overrides,
    }
}

const AI_AGENT_SENDER = createSender({
    id: 789726418,
    email: 'bot@658d6f54fbff9b7c6f2d0321',
    name: 'Bobby Artemis',
    firstname: 'Bobby',
    lastname: 'Artemis',
})

function createMessage(
    overrides: Partial<TicketMessage>,
): TicketThreadMessageData {
    return {
        id: 1,
        channel: 'chat',
        from_agent: false,
        via: 'chat',
        created_datetime: '2024-03-21T11:00:00Z',
        sender: createSender(),
        public: true,
        body_html: '<p>hello</p>',
        body_text: 'hello',
        source: { type: 'chat' },
        meta: null,
        ...overrides,
    } as TicketThreadMessageData
}

describe('groupConsecutiveMessages', () => {
    it('merges consecutive compatible messages', () => {
        const first = toTaggedMessage(createMessage({ id: 1 }))
        const second = toTaggedMessage(
            createMessage({
                id: 2,
                created_datetime: '2024-03-21T11:03:00Z',
            }),
        )

        const merged = groupConsecutiveMessages([first, second])

        expect(merged).toHaveLength(1)
        expect(merged[0]).toMatchObject({
            _tag: TicketThreadItemTag.Messages.GroupedMessages,
        })
    })

    it('does not merge signal messages', () => {
        const first = toTaggedMessage(createMessage({ id: 1 }))
        const second = toTaggedMessage(
            createMessage({
                id: 2,
                meta: { type: 'signal' },
                created_datetime: '2024-03-21T11:03:00Z',
            }),
        )

        const merged = groupConsecutiveMessages([first, second])

        expect(merged).toHaveLength(2)
        expect(merged[0]).toMatchObject({
            _tag: TicketThreadItemTag.Messages.Message,
        })
        expect(merged[1]).toMatchObject({
            _tag: TicketThreadItemTag.Messages.Message,
        })
    })

    it('does not merge consecutive ai agent messages', () => {
        const aiAgentSender = {
            ...createMessage({}).sender,
            id: 789726418,
            email: 'bot@658d6f54fbff9b7c6f2d0321',
            name: 'Bobby Artemis',
        }
        const first = toTaggedMessage(
            createMessage({
                id: 1,
                from_agent: true,
                sender: aiAgentSender,
            }),
        )
        const second = toTaggedMessage(
            createMessage({
                id: 2,
                from_agent: true,
                created_datetime: '2024-03-21T11:03:00Z',
                sender: aiAgentSender,
            }),
        )

        const merged = groupConsecutiveMessages([first, second])

        expect(merged).toHaveLength(2)
        expect(merged[0]).toMatchObject({
            _tag: TicketThreadItemTag.Messages.AiAgentMessage,
        })
        expect(merged[1]).toMatchObject({
            _tag: TicketThreadItemTag.Messages.AiAgentMessage,
        })
    })

    it.each([
        {
            label: 'internal notes',
            firstOverrides: {
                public: false,
            },
            secondOverrides: {
                public: false,
            },
            expectedTag: TicketThreadItemTag.Messages.AiAgentInternalNote,
        },
        {
            label: 'draft messages',
            firstOverrides: {
                body_html: `<div ${AI_AGENT_DRAFT_MESSAGE_TAG}></div>`,
            },
            secondOverrides: {
                body_html: `<div ${AI_AGENT_DRAFT_MESSAGE_TAG}></div>`,
            },
            expectedTag: TicketThreadItemTag.Messages.AiAgentDraftMessage,
        },
        {
            label: 'trial messages',
            firstOverrides: {
                body_html: `<div ${AI_AGENT_TRIAL_MESSAGE_TAG}></div>`,
            },
            secondOverrides: {
                body_html: `<div ${AI_AGENT_TRIAL_MESSAGE_TAG}></div>`,
            },
            expectedTag: TicketThreadItemTag.Messages.AiAgentTrialMessage,
        },
    ])(
        'does not merge consecutive ai agent $label',
        ({ firstOverrides, secondOverrides, expectedTag }) => {
            const first = toTaggedMessage(
                createMessage({
                    id: 1,
                    from_agent: true,
                    sender: AI_AGENT_SENDER,
                    ...firstOverrides,
                }),
            )
            const second = toTaggedMessage(
                createMessage({
                    id: 2,
                    from_agent: true,
                    created_datetime: '2024-03-21T11:03:00Z',
                    sender: AI_AGENT_SENDER,
                    ...secondOverrides,
                }),
            )

            const merged = groupConsecutiveMessages([first, second])

            expect(merged).toHaveLength(2)
            expect(merged[0]).toMatchObject({
                _tag: expectedTag,
            })
            expect(merged[1]).toMatchObject({
                _tag: expectedTag,
            })
        },
    )

    it('merges a consecutive three-message chain based on adjacent windows', () => {
        const first = toTaggedMessage(
            createMessage({
                id: 1,
                created_datetime: '2024-03-21T11:00:00Z',
            }),
        )
        const second = toTaggedMessage(
            createMessage({
                id: 2,
                created_datetime: '2024-03-21T11:04:00Z',
            }),
        )
        const third = toTaggedMessage(
            createMessage({
                id: 3,
                created_datetime: '2024-03-21T11:08:00Z',
            }),
        )

        const merged = groupConsecutiveMessages([first, second, third])

        expect(merged).toHaveLength(1)
        expect(merged[0]).toMatchObject({
            _tag: TicketThreadItemTag.Messages.GroupedMessages,
        })
        expect((merged[0] as any).data).toHaveLength(3)
    })
})

describe('toTaggedMessage', () => {
    it('tags instagram story mention messages', () => {
        const item = toTaggedMessage(
            createMessage({
                source: { type: 'instagram-direct-message' },
                meta: { is_story_mention: true },
            }),
        )

        expect(item._tag).toBe(
            TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention,
        )
    })

    it('tags instagram story reply messages', () => {
        const item = toTaggedMessage(
            createMessage({
                source: { type: 'instagram-direct-message' },
                meta: { is_story_reply: true },
            }),
        )

        expect(item._tag).toBe(
            TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply,
        )
    })

    it.each([
        {
            label: 'regular messages',
            expectedTag: TicketThreadItemTag.Messages.Message,
            overrides: {},
        },
        {
            label: 'internal notes',
            expectedTag: TicketThreadItemTag.Messages.InternalNote,
            overrides: { public: false },
        },
        {
            label: 'ai agent messages',
            expectedTag: TicketThreadItemTag.Messages.AiAgentMessage,
            overrides: {
                sender: AI_AGENT_SENDER,
            },
        },
        {
            label: 'ai agent internal notes',
            expectedTag: TicketThreadItemTag.Messages.AiAgentInternalNote,
            overrides: {
                public: false,
                sender: AI_AGENT_SENDER,
            },
        },
        {
            label: 'ai agent draft messages',
            expectedTag: TicketThreadItemTag.Messages.AiAgentDraftMessage,
            overrides: {
                body_html: `<div ${AI_AGENT_DRAFT_MESSAGE_TAG}></div>`,
                sender: AI_AGENT_SENDER,
            },
        },
        {
            label: 'ai agent trial messages',
            expectedTag: TicketThreadItemTag.Messages.AiAgentTrialMessage,
            overrides: {
                body_html: `<div ${AI_AGENT_TRIAL_MESSAGE_TAG}></div>`,
                sender: AI_AGENT_SENDER,
            },
        },
        {
            label: 'facebook comments',
            expectedTag:
                TicketThreadItemTag.Messages.SocialMediaFacebookComment,
            overrides: {
                source: { type: 'facebook-comment' },
            },
        },
        {
            label: 'facebook posts',
            expectedTag: TicketThreadItemTag.Messages.SocialMediaFacebookPost,
            overrides: {
                source: { type: 'facebook-post' },
            },
        },
        {
            label: 'facebook messages',
            expectedTag:
                TicketThreadItemTag.Messages.SocialMediaFacebookMessage,
            overrides: {
                source: { type: 'facebook-message' },
            },
        },
        {
            label: 'instagram comments',
            expectedTag:
                TicketThreadItemTag.Messages.SocialMediaInstagramComment,
            overrides: {
                source: { type: 'instagram-comment' },
            },
        },
        {
            label: 'instagram direct messages',
            expectedTag:
                TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage,
            overrides: {
                source: { type: 'instagram-direct-message' },
            },
        },
        {
            label: 'instagram media messages',
            expectedTag: TicketThreadItemTag.Messages.SocialMediaInstagramMedia,
            overrides: {
                source: { type: 'instagram-media' },
            },
        },
        {
            label: 'instagram story mentions',
            expectedTag:
                TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention,
            overrides: {
                source: { type: 'instagram-direct-message' },
                meta: { is_story_mention: true },
            },
        },
        {
            label: 'instagram story replies',
            expectedTag:
                TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply,
            overrides: {
                source: { type: 'instagram-direct-message' },
                meta: { is_story_reply: true },
            },
        },
        {
            label: 'twitter tweets',
            expectedTag: TicketThreadItemTag.Messages.SocialMediaTwitterTweet,
            overrides: {
                source: { type: 'twitter-tweet' },
            },
        },
        {
            label: 'twitter direct messages',
            expectedTag:
                TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage,
            overrides: {
                source: { type: 'twitter-direct-message' },
            },
        },
        {
            label: 'whatsapp messages',
            expectedTag:
                TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage,
            overrides: {
                source: { type: 'whatsapp-message' },
            },
        },
    ])(
        'preserves the pending state for $label',
        ({ expectedTag, overrides }) => {
            const item = toTaggedMessage(createMessage(overrides), {
                pendingState: TicketThreadPendingState.Active,
            })

            expect(item._tag).toBe(expectedTag)
            expect(item.pendingState).toBe(TicketThreadPendingState.Active)
        },
    )
})
