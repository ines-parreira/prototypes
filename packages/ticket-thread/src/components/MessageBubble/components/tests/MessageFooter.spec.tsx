import { screen } from '@testing-library/react'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'

import { useExpandedMessages } from '../../../../contexts/ExpandedMessages'
import type { TicketThreadRegularMessageItem } from '../../../../hooks/messages/types'
import { TicketThreadItemTag } from '../../../../hooks/types'
import { render } from '../../../../tests/render.utils'
import { MessageFooter } from '../MessageFooter'

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

function makeItem(
    overrides: Partial<TicketThreadRegularMessageItem['data']> = {},
) {
    return {
        _tag: TicketThreadItemTag.Messages.Message,
        data: mockTicketMessage({
            id: 456,
            ticket_id: 123,
            body_html: null,
            body_text: 'Hello world',
            stripped_html: null,
            stripped_text: 'Hello world',
            ...overrides,
        }),
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
})
