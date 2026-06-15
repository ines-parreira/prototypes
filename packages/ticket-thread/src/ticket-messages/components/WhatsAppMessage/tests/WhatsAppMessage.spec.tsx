import type * as TicketsModule from '@repo/tickets'
import {
    DisplayedContent,
    useCurrentUserLanguagePreferences,
    useTicketMessageDisplayState,
    useTicketMessageTranslations,
} from '@repo/tickets'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import {
    mockGetTicketHandler,
    mockGetUserAvailabilityHandler,
    mockTicket,
    mockTicketMessage,
    mockTicketMessageTranslation,
} from '@gorgias/helpdesk-mocks'

import { useTicketThreadDateTimeFormat } from '../../../../shared/hooks/useTicketThreadDateTimeFormat'
import { render } from '../../../../tests/render.utils'
import { server } from '../../../../tests/server'
import { TicketThreadItemTag } from '../../../../thread/itemTags'
import { TicketThreadPendingState } from '../../../types'
import type { TicketThreadSocialMediaWhatsAppMessageItem } from '../../../types'
import { WhatsAppMessage } from '../WhatsAppMessage'

vi.mock('../../../../shared/hooks/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(),
}))

vi.mock('@repo/tickets', async () => {
    const actual = await vi.importActual<typeof TicketsModule>('@repo/tickets')
    return {
        ...actual,
        useCurrentUserLanguagePreferences: vi.fn(() => ({
            shouldShowTranslatedContent: () => false,
        })),
        useTicketMessageTranslations: vi.fn(() => ({
            getMessageTranslation: () => null,
        })),
        useTicketMessageDisplayState: vi.fn(() => ({
            display: actual.DisplayedContent.Original,
        })),
    }
})

const mockUseTicketThreadDateTimeFormat = vi.mocked(
    useTicketThreadDateTimeFormat,
)
const mockUseCurrentUserLanguagePreferences = vi.mocked(
    useCurrentUserLanguagePreferences,
)
const mockUseTicketMessageTranslations = vi.mocked(useTicketMessageTranslations)
const mockUseTicketMessageDisplayState = vi.mocked(useTicketMessageDisplayState)

beforeEach(() => {
    vi.clearAllMocks()
    window.GORGIAS_STATE = {
        currentAccount: {
            domain: 'acme',
            user_id: 1,
        },
    }
    server.use(
        http.get('/api/users/:id', () => HttpResponse.json({})),
        mockGetTicketHandler(async ({ params }) =>
            HttpResponse.json(mockTicket({ id: Number(params?.id ?? 1) })),
        ).handler,
        mockGetUserAvailabilityHandler().handler,
    )
    mockUseCurrentUserLanguagePreferences.mockReturnValue({
        shouldShowTranslatedContent: () => false,
    } as ReturnType<typeof useCurrentUserLanguagePreferences>)
    mockUseTicketMessageTranslations.mockReturnValue({
        getMessageTranslation: () => null,
    } as unknown as ReturnType<typeof useTicketMessageTranslations>)
    mockUseTicketMessageDisplayState.mockReturnValue({
        display: DisplayedContent.Original,
    } as ReturnType<typeof useTicketMessageDisplayState>)
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

    it('renders the translated message body when translation display is enabled', () => {
        mockUseCurrentUserLanguagePreferences.mockReturnValue({
            shouldShowTranslatedContent: () => true,
        } as ReturnType<typeof useCurrentUserLanguagePreferences>)
        mockUseTicketMessageDisplayState.mockReturnValue({
            display: DisplayedContent.Translated,
        } as ReturnType<typeof useTicketMessageDisplayState>)
        mockUseTicketMessageTranslations.mockReturnValue({
            getMessageTranslation: () =>
                mockTicketMessageTranslation({
                    ticket_message_id: 1,
                    stripped_text: 'Translated WhatsApp body',
                    stripped_html: null,
                }),
        } as unknown as ReturnType<typeof useTicketMessageTranslations>)

        render(<WhatsAppMessage item={makeItem({ id: 1 })} />)

        expect(screen.getByText('Translated WhatsApp body')).toBeInTheDocument()
        expect(
            screen.queryByText('Hello from WhatsApp'),
        ).not.toBeInTheDocument()
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
