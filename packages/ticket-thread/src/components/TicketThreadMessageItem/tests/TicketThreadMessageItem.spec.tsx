import { render, screen } from '@testing-library/react'

import type { TicketThreadMessageItem } from '../../../hooks/messages/types'
import { TicketThreadItemTag } from '../../../hooks/types'
import { TicketThreadMessageItem as TicketThreadMessageItemComponent } from '../TicketThreadMessageItem'

const messageData = { id: 1, body_text: 'hello' }

function renderItem(item: TicketThreadMessageItem) {
    return render(<TicketThreadMessageItemComponent item={item} />)
}

describe('TicketThreadMessageItem', () => {
    const messageTags = [
        {
            tag: TicketThreadItemTag.Messages.AiAgentMessage,
            label: 'AI agent message',
        },
        {
            tag: TicketThreadItemTag.Messages.AiAgentInternalNote,
            label: 'AI agent internal note',
        },
        {
            tag: TicketThreadItemTag.Messages.AiAgentDraftMessage,
            label: 'AI agent draft message',
        },
        {
            tag: TicketThreadItemTag.Messages.AiAgentTrialMessage,
            label: 'AI agent trial message',
        },
        {
            tag: TicketThreadItemTag.Messages.SocialMediaFacebookComment,
            label: 'Facebook comment',
        },
        {
            tag: TicketThreadItemTag.Messages.SocialMediaFacebookPost,
            label: 'Facebook post',
        },
        {
            tag: TicketThreadItemTag.Messages.SocialMediaFacebookMessage,
            label: 'Facebook message',
        },
        {
            tag: TicketThreadItemTag.Messages.SocialMediaInstagramComment,
            label: 'Instagram comment',
        },
        {
            tag: TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage,
            label: 'Instagram DM',
        },
        {
            tag: TicketThreadItemTag.Messages.SocialMediaInstagramMedia,
            label: 'Instagram media',
        },
        {
            tag: TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention,
            label: 'Instagram story mention',
        },
        {
            tag: TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply,
            label: 'Instagram story reply',
        },
        {
            tag: TicketThreadItemTag.Messages.SocialMediaTwitterTweet,
            label: 'Twitter tweet',
        },
        {
            tag: TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage,
            label: 'Twitter DM',
        },
        {
            tag: TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage,
            label: 'WhatsApp message',
        },
    ]

    it.each(messageTags)('renders $label item', ({ tag }) => {
        renderItem({
            _tag: tag,
            data: messageData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(
            screen.getByText(JSON.stringify(messageData)),
        ).toBeInTheDocument()
    })

    it('aligns agent messages to the right', () => {
        const data = {
            ...messageData,
            channel: 'email',
            via: 'email',
            from_agent: true,
        }

        renderItem({
            _tag: TicketThreadItemTag.Messages.Message,
            data,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(
            screen.getByText(messageData.body_text).parentElement,
        ).toHaveStyle({
            alignSelf: 'flex-end',
        })
    })

    it('aligns customer messages to the left', () => {
        const data = {
            ...messageData,
            channel: 'email',
            via: 'email',
            from_agent: false,
        }

        renderItem({
            _tag: TicketThreadItemTag.Messages.Message,
            data,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(
            screen.getByText(messageData.body_text).parentElement,
        ).toHaveStyle({
            alignSelf: 'flex-start',
        })
    })

    it('renders message item', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.Message,
            data: { ...messageData, stripped_text: 'hello' },
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText('hello')).toBeInTheDocument()
    })

    it('renders internal note item', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.InternalNote,
            data: { ...messageData, stripped_text: 'hello' },
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText('hello')).toBeInTheDocument()
    })

    it('renders merged messages item', () => {
        const mergedData = [
            {
                _tag: TicketThreadItemTag.Messages.Message,
                data: messageData,
                datetime: '2024-03-21T11:00:00Z',
            },
        ]

        renderItem({
            _tag: TicketThreadItemTag.Messages.MergedMessages,
            data: mergedData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText(JSON.stringify(mergedData))).toBeInTheDocument()
    })
})
