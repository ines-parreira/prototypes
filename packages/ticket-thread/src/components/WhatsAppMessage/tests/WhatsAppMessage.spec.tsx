import { screen } from '@testing-library/react'

import {
    mockGetUserAvailabilityHandler,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'

import { TicketThreadPendingState } from '../../../hooks/messages/types'
import type { TicketThreadSocialMediaWhatsAppMessageItem } from '../../../hooks/messages/types'
import { useTicketThreadDateTimeFormat } from '../../../hooks/shared/useTicketThreadDateTimeFormat'
import { TicketThreadItemTag } from '../../../hooks/types'
import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { WhatsAppMessage } from '../WhatsAppMessage'

vi.mock('../../../hooks/shared/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(),
}))

const mockUseTicketThreadDateTimeFormat = vi.mocked(
    useTicketThreadDateTimeFormat,
)

beforeEach(() => {
    window.GORGIAS_STATE = {
        currentAccount: {
            domain: 'acme',
        },
    }
    server.use(mockGetUserAvailabilityHandler().handler)
    mockUseTicketThreadDateTimeFormat.mockReturnValue({
        format: {
            relative: 'YYYY-MM-DD',
            compact: 'YYYY-MM-DD HH:mm',
        },
        timezone: undefined,
    })
})

function makeItem(
    overrides: Partial<ReturnType<typeof mockTicketMessage>> = {},
): TicketThreadSocialMediaWhatsAppMessageItem {
    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage,
        datetime: '2024-03-21T11:00:00Z',
        data: {
            ...mockTicketMessage({
                body_html: null,
                stripped_html: null,
                stripped_text: 'Hello from WhatsApp',
                body_text: 'Hello from WhatsApp',
                source: { type: 'whatsapp-message' },
                ...overrides,
            }),
            source: { type: 'whatsapp-message' },
            ...overrides,
        },
    } as TicketThreadSocialMediaWhatsAppMessageItem
}

describe('WhatsAppMessage', () => {
    it('renders the sender name', () => {
        const item = makeItem({
            sender: {
                id: 1,
                firstname: 'Alice',
                lastname: '',
                name: 'Alice',
                email: 'alice@example.com',
                meta: null,
            },
        })

        render(<WhatsAppMessage item={item} />)

        expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    it('falls back to sender email when name is missing', () => {
        const item = makeItem({
            sender: {
                id: 1,
                firstname: '',
                lastname: '',
                name: null,
                email: 'alice@example.com',
                meta: null,
            },
        })

        render(<WhatsAppMessage item={item} />)

        expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    })

    it('renders the message body', () => {
        const item = makeItem({
            stripped_text: 'Hello from WhatsApp',
            body_text: 'Hello from WhatsApp',
        })

        render(<WhatsAppMessage item={item} />)

        expect(screen.getByText('Hello from WhatsApp')).toBeInTheDocument()
    })

    it('renders message attachments', () => {
        const item = makeItem({
            attachments: [
                {
                    name: 'receipt.pdf',
                    url: 'https://cdn.example.com/receipt.pdf',
                    content_type: 'application/pdf',
                    size: 1234,
                },
            ],
        })

        render(<WhatsAppMessage item={item} />)

        expect(
            screen.getByRole('link', { name: 'receipt.pdf' }),
        ).toBeInTheDocument()
    })

    it('renders the pending banner for active pending WhatsApp messages', () => {
        const item = {
            ...makeItem({
                from_agent: true,
                stripped_text: 'Hello from WhatsApp',
                body_text: 'Hello from WhatsApp',
            }),
            pendingState: TicketThreadPendingState.Active,
        }

        render(<WhatsAppMessage item={item} />)

        expect(screen.getByText('Message sending...')).toBeInTheDocument()
    })

    it('renders only the message body when grouped', () => {
        const item = makeItem()

        render(<WhatsAppMessage item={item} isGrouped />)

        expect(screen.queryByText('Alice')).not.toBeInTheDocument()
        expect(screen.getByText('Hello from WhatsApp')).toBeInTheDocument()
    })

    it('renders attachments when grouped', () => {
        const item = makeItem({
            attachments: [
                {
                    name: 'grouped-receipt.pdf',
                    url: 'https://cdn.example.com/grouped-receipt.pdf',
                    content_type: 'application/pdf',
                    size: 1234,
                },
            ],
        })

        render(<WhatsAppMessage item={item} isGrouped />)

        expect(
            screen.getByRole('link', { name: 'grouped-receipt.pdf' }),
        ).toBeInTheDocument()
    })
})
