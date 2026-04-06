import type * as TicketsModule from '@repo/tickets'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import {
    mockGetTicketHandler,
    mockTicket,
    mockTicketMessage,
    mockTicketMessageSource,
    mockTicketMessageSourceAddress,
} from '@gorgias/helpdesk-mocks'

import type {
    TicketThreadGroupedMessagesItem,
    TicketThreadRegularMessageItem,
    TicketThreadSingleMessageItem,
    TicketThreadSocialMediaFacebookMessageItem,
    TicketThreadSocialMediaInstagramDirectMessageItem,
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

type SingleMessageTag = TicketThreadSingleMessageItem['_tag']
type ItemForTag<TTag extends SingleMessageTag> = Extract<
    TicketThreadSingleMessageItem,
    { _tag: TTag }
>

const facebookMessageSource = {
    ...mockTicketMessageSource({ type: 'facebook-message' }),
    type: 'facebook-message' as const,
}

const instagramDirectMessageSource = {
    ...mockTicketMessageSource({ type: 'instagram-direct-message' }),
    type: 'instagram-direct-message' as const,
    from: {
        ...mockTicketMessageSourceAddress({ name: 'Alice', address: null }),
        name: 'Alice',
        address: null,
    },
    to: [
        {
            ...mockTicketMessageSourceAddress({
                name: 'Support',
                address: null,
            }),
            name: 'Support',
            address: null,
        },
    ],
}

function makeFacebookMessageItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.SocialMediaFacebookMessage
        >['data']
    > = {},
): TicketThreadSocialMediaFacebookMessageItem {
    const bodyText = overrides.body_text ?? 'hello'
    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaFacebookMessage,
        data: {
            ...mockTicketMessage({
                id: overrides.id ?? 1,
                ticket_id: 123,
                channel: 'facebook-messenger' as const,
                via: 'facebook-messenger' as const,
                body_html: null,
                stripped_html: null,
                body_text: bodyText,
                stripped_text: overrides.stripped_text ?? bodyText,
                attachments: [],
                from_agent: overrides.from_agent ?? false,
            }),
            ...overrides,
            source: facebookMessageSource,
        } as TicketThreadSocialMediaFacebookMessageItem['data'],
        datetime: '2024-03-21T11:00:00Z',
    }
}

function makeInstagramDmItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage
        >['data']
    > = {},
): TicketThreadSocialMediaInstagramDirectMessageItem {
    const bodyText = overrides.body_text ?? 'hello'
    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage,
        data: {
            ...mockTicketMessage({
                id: overrides.id ?? 1,
                ticket_id: 123,
                channel: 'instagram-direct-message' as const,
                via: 'instagram-direct-message' as const,
                body_html: null,
                stripped_html: null,
                body_text: bodyText,
                stripped_text: overrides.stripped_text ?? bodyText,
                attachments: [],
                from_agent: overrides.from_agent ?? false,
            }),
            ...overrides,
            source: instagramDirectMessageSource,
        } as TicketThreadSocialMediaInstagramDirectMessageItem['data'],
        datetime: '2024-03-21T11:00:00Z',
    }
}

function makeSocialGroupedItem(
    messages: TicketThreadSingleMessageItem[],
): TicketThreadGroupedMessagesItem {
    return {
        _tag: TicketThreadItemTag.Messages.GroupedMessages,
        datetime: '2024-03-21T11:00:00Z',
        data: messages,
    }
}

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

describe('TicketThreadGroupedMessages – social message action placement', () => {
    it('renders BubbleActions in the header for the first message, not inside the first grouped message', () => {
        const item = makeSocialGroupedItem([
            makeFacebookMessageItem({ id: 1, body_text: 'first' }),
            makeFacebookMessageItem({ id: 2, body_text: 'second' }),
        ])

        const { container } = render(
            <TicketThreadGroupedMessages item={item} />,
        )

        const header = container.querySelector('[data-grouped-header]')!
        const messages = container.querySelectorAll('[data-grouped-message]')

        // Header has BubbleActions for the first message
        expect(header.querySelector('[data-placement]')).toBeInTheDocument()

        // First grouped message has no own BubbleActions
        expect(
            messages[0].querySelector('[data-placement]'),
        ).not.toBeInTheDocument()

        // Second grouped message has its own BubbleActions
        expect(
            messages[1].querySelector('[data-placement]'),
        ).toBeInTheDocument()
    })

    it('renders BubbleActions in each subsequent message for multiple grouped messages', () => {
        const item = makeSocialGroupedItem([
            makeFacebookMessageItem({ id: 1, body_text: 'first' }),
            makeFacebookMessageItem({ id: 2, body_text: 'second' }),
            makeFacebookMessageItem({ id: 3, body_text: 'third' }),
        ])

        const { container } = render(
            <TicketThreadGroupedMessages item={item} />,
        )

        const messages = container.querySelectorAll('[data-grouped-message]')

        expect(
            messages[0].querySelector('[data-placement]'),
        ).not.toBeInTheDocument()
        expect(
            messages[1].querySelector('[data-placement]'),
        ).toBeInTheDocument()
        expect(
            messages[2].querySelector('[data-placement]'),
        ).toBeInTheDocument()
    })

    it('sets placement="right" for inbound Facebook Messenger messages (from_agent: false)', () => {
        const item = makeSocialGroupedItem([
            makeFacebookMessageItem({
                id: 1,
                body_text: 'first',
                from_agent: false,
            }),
            makeFacebookMessageItem({
                id: 2,
                body_text: 'second',
                from_agent: false,
            }),
        ])

        const { container } = render(
            <TicketThreadGroupedMessages item={item} />,
        )

        const placements = container.querySelectorAll('[data-placement]')

        for (const el of placements) {
            expect(el).toHaveAttribute('data-placement', 'right')
        }
    })

    it('sets placement="left" for outbound Facebook Messenger messages (from_agent: true)', () => {
        const item = makeSocialGroupedItem([
            makeFacebookMessageItem({
                id: 1,
                body_text: 'first',
                from_agent: true,
            }),
            makeFacebookMessageItem({
                id: 2,
                body_text: 'second',
                from_agent: true,
            }),
        ])

        const { container } = render(
            <TicketThreadGroupedMessages item={item} />,
        )

        const placements = container.querySelectorAll('[data-placement]')

        for (const el of placements) {
            expect(el).toHaveAttribute('data-placement', 'left')
        }
    })

    it('renders Instagram DM grouped messages with the same action structure as Facebook Messenger', () => {
        const item = makeSocialGroupedItem([
            makeInstagramDmItem({ id: 1, body_text: 'first dm' }),
            makeInstagramDmItem({ id: 2, body_text: 'second dm' }),
        ])

        const { container } = render(
            <TicketThreadGroupedMessages item={item} />,
        )

        const header = container.querySelector('[data-grouped-header]')!
        const messages = container.querySelectorAll('[data-grouped-message]')

        expect(screen.getByText('first dm')).toBeInTheDocument()
        expect(screen.getByText('second dm')).toBeInTheDocument()
        expect(header.querySelector('[data-placement]')).toBeInTheDocument()
        expect(
            messages[0].querySelector('[data-placement]'),
        ).not.toBeInTheDocument()
        expect(
            messages[1].querySelector('[data-placement]'),
        ).toBeInTheDocument()
    })
})
