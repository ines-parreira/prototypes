import type * as TicketsModule from '@repo/tickets'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import {
    mockGetTicketHandler,
    mockTicket,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'

import type {
    TicketThreadGroupedMessagesItem,
    TicketThreadRegularMessageItem,
} from '../../../hooks/messages/types'
import { useTicketThreadDateTimeFormat } from '../../../hooks/shared/useTicketThreadDateTimeFormat'
import { TicketThreadItemTag } from '../../../hooks/types'
import { getCurrentUserHandler } from '../../../tests/getCurrentUser.mock'
import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { TicketThreadGroupedMessages } from '../TicketThreadGroupedMessages'

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

vi.mock('../../../hooks/shared/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(),
}))

const mockUseTicketThreadDateTimeFormat = vi.mocked(
    useTicketThreadDateTimeFormat,
)

function makeGroupedItem(): TicketThreadGroupedMessagesItem {
    return {
        _tag: TicketThreadItemTag.Messages.GroupedMessages,
        datetime: '2024-03-21T11:00:00Z',
        data: [
            {
                _tag: TicketThreadItemTag.Messages.Message,
                data: mockTicketMessage({
                    id: 1,
                    ticket_id: 123,
                    channel: 'chat' as const,
                    via: 'chat' as const,
                    body_html: null,
                    stripped_html: null,
                    body_text: 'hello',
                    stripped_text: 'hello',
                    attachments: [],
                    sender: {
                        id: 1,
                        name: 'Alice',
                        firstname: 'Alice',
                        lastname: '',
                        email: 'alice@example.com',
                        meta: null,
                    },
                }) as TicketThreadRegularMessageItem['data'],
                datetime: '2024-03-21T11:00:00Z',
            },
            {
                _tag: TicketThreadItemTag.Messages.Message,
                data: mockTicketMessage({
                    id: 2,
                    ticket_id: 123,
                    channel: 'chat' as const,
                    via: 'chat' as const,
                    body_html: null,
                    stripped_html: null,
                    body_text: 'follow up',
                    stripped_text: 'follow up',
                    attachments: [],
                    sender: {
                        id: 1,
                        name: 'Alice',
                        firstname: 'Alice',
                        lastname: '',
                        email: 'alice@example.com',
                        meta: null,
                    },
                }) as TicketThreadRegularMessageItem['data'],
                datetime: '2024-03-21T11:03:00Z',
            },
        ],
    }
}

beforeEach(() => {
    server.use(getCurrentUserHandler().handler)
    window.GORGIAS_STATE = {
        currentAccount: {
            domain: 'acme',
        },
    }
    server.use(
        http.get('/api/users/:id', () => HttpResponse.json({})),
        mockGetTicketHandler(async ({ params }) =>
            HttpResponse.json(
                mockTicket({
                    id: Number(params?.id ?? 1),
                }),
            ),
        ).handler,
    )
    mockUseTicketThreadDateTimeFormat.mockReturnValue({
        format: {
            relative: 'YYYY-MM-DD',
            compact: 'YYYY-MM-DD HH:mm',
        },
        timezone: undefined,
    })
})

describe('TicketThreadGroupedMessages', () => {
    it('renders a shared header and all grouped message bodies', () => {
        render(<TicketThreadGroupedMessages item={makeGroupedItem()} />)

        expect(screen.getByText('Alice')).toBeInTheDocument()
        expect(screen.getByText('hello')).toBeInTheDocument()
        expect(screen.getByText('follow up')).toBeInTheDocument()
    })

    it('returns null when there are no grouped messages', () => {
        const item = {
            _tag: TicketThreadItemTag.Messages.GroupedMessages,
            datetime: '2024-03-21T11:00:00Z',
            data: [],
        } as TicketThreadGroupedMessagesItem

        const { container } = render(
            <TicketThreadGroupedMessages item={item} />,
        )

        expect(container).toBeEmptyDOMElement()
    })
})
