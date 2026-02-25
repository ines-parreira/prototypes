import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { TicketThreadItemTag } from '../../types'
import { mergeConsecutiveMessages, toTaggedMessage } from '../transforms'

function createMessage(overrides: Partial<TicketMessage>): TicketMessage {
    return {
        id: 1,
        channel: 'chat',
        from_agent: false,
        via: 'chat',
        created_datetime: '2024-03-21T11:00:00Z',
        sender: {
            id: 10,
            email: 'customer@gorgias.com',
            name: 'Customer',
        },
        public: true,
        body_html: '<p>hello</p>',
        body_text: 'hello',
        source: { type: 'chat' },
        meta: null,
        ...overrides,
    } as TicketMessage
}

describe('mergeConsecutiveMessages', () => {
    it('merges consecutive compatible messages', () => {
        const first = toTaggedMessage(createMessage({ id: 1 }))
        const second = toTaggedMessage(
            createMessage({
                id: 2,
                created_datetime: '2024-03-21T11:03:00Z',
            }),
        )

        const merged = mergeConsecutiveMessages([first, second])

        expect(merged).toHaveLength(1)
        expect(merged[0]).toMatchObject({
            _tag: TicketThreadItemTag.Messages.MergedMessages,
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

        const merged = mergeConsecutiveMessages([first, second])

        expect(merged).toHaveLength(2)
        expect(merged[0]).toMatchObject({
            _tag: TicketThreadItemTag.Messages.Message,
        })
        expect(merged[1]).toMatchObject({
            _tag: TicketThreadItemTag.Messages.Message,
        })
    })

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

        const merged = mergeConsecutiveMessages([first, second, third])

        expect(merged).toHaveLength(1)
        expect(merged[0]).toMatchObject({
            _tag: TicketThreadItemTag.Messages.MergedMessages,
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
})
