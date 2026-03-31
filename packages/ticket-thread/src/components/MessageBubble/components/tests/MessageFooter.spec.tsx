import { screen } from '@testing-library/react'

import {
    mockTicketMessage,
    mockTicketMessageTranslation,
} from '@gorgias/helpdesk-mocks'

import { useExpandedMessages } from '../../../../contexts/ExpandedMessages'
import type { TicketThreadRegularMessageItem } from '../../../../hooks/messages/types'
import { TicketThreadItemTag } from '../../../../hooks/types'
import { render } from '../../../../tests/render.utils'
import type { DisplayedTicketThreadRegularMessageItem } from '../../../TicketMessage/hooks/useDisplayedTicketMessage'
import { MessageFooter } from '../MessageFooter'

type MessageFooterData = DisplayedTicketThreadRegularMessageItem['data']

vi.mock('react-player', () => ({
    default: ({ url }: { url: string }) => <div>{`react-player:${url}`}</div>,
}))

vi.mock('../../../../contexts/ExpandedMessages', () => ({
    useExpandedMessages: vi.fn(),
}))

vi.mock('../MessageAttachments', () => ({
    MessageAttachments: ({
        item,
    }: {
        item: TicketThreadRegularMessageItem
    }) => <div>{`attachments:${item.data.id}`}</div>,
}))

vi.mock('../TranslationsDropdown', () => ({
    TranslationsDropdown: ({
        messageId,
        ticketId,
    }: {
        messageId: number
        ticketId: number
    }) => <div>{`translations:${messageId}:${ticketId}`}</div>,
}))

const mockUseExpandedMessages = vi.mocked(useExpandedMessages)

const toggleMessage = vi.fn()

function makeItem(overrides: Partial<MessageFooterData> = {}) {
    return {
        _tag: TicketThreadItemTag.Messages.Message,
        data: mockTicketMessage({
            id: 456,
            ticket_id: 123,
            channel: 'chat',
            body_html: null,
            body_text: 'Hello world',
            stripped_html: null,
            stripped_text: 'Hello world',
            ...overrides,
        }) as MessageFooterData,
        datetime: '2024-03-21T11:00:00Z',
    } as TicketThreadRegularMessageItem
}

beforeEach(() => {
    toggleMessage.mockReset()
    mockUseExpandedMessages.mockReturnValue({
        expandedMessageIds: [],
        toggleMessage,
        isMessageExpanded: vi.fn(() => false),
    })
})

describe('MessageFooter', () => {
    it('renders attachments and translations dropdown for messages with id', () => {
        render(<MessageFooter item={makeItem()} />)

        expect(screen.getByText('attachments:456')).toBeInTheDocument()
        expect(screen.getByText('translations:456:123')).toBeInTheDocument()
    })

    it('renders strip toggle when stripped content differs and toggles expansion', async () => {
        const { user } = render(
            <MessageFooter
                item={makeItem({
                    body_text: 'Hello world with signature',
                    stripped_text: 'Hello world',
                })}
            />,
        )

        await user.click(
            screen.getByRole('img', { name: /dots-meatballs-horizontal/i }),
        )

        expect(toggleMessage).toHaveBeenCalledWith(456)
    })

    it('hides strip toggle when content is not stripped', () => {
        render(<MessageFooter item={makeItem()} />)

        expect(screen.getByText('attachments:456')).toBeInTheDocument()
        expect(screen.getByText('translations:456:123')).toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('does not render strip toggle when only translated stripped content differs', () => {
        render(
            <MessageFooter
                item={makeItem({
                    body_html: '<p>Hello world</p>',
                    body_text: 'Hello world',
                    stripped_html: '<p>Hello world</p>',
                    stripped_text: 'Hello world',
                    translations: mockTicketMessageTranslation({
                        stripped_html: '<p>Bonjour le monde</p>',
                        stripped_text: 'Bonjour le monde',
                    }),
                })}
            />,
        )

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('renders videos when present in html content', () => {
        render(
            <MessageFooter
                item={makeItem({
                    body_html: `
                        <div>text before video</div>
                        <div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="600"></div>
                        <div>text after video</div>
                    `,
                    body_text: null,
                    stripped_html: null,
                    stripped_text: null,
                })}
            />,
        )

        const player = screen.getByText(
            'react-player:https://www.youtube.com/watch?v=4sLFpe-xbhk',
        )

        expect(player).toBeInTheDocument()
    })
})
