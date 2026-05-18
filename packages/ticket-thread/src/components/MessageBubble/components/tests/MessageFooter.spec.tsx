import type * as TicketsModule from '@repo/tickets'
import {
    DisplayedContent,
    FetchingState,
    useTicketMessageDisplayState,
    useTicketMessageTranslations,
} from '@repo/tickets'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockGetTicketHandler,
    mockTicket,
    mockTicketMessage,
    mockTicketMessageTranslation,
} from '@gorgias/helpdesk-mocks'

import * as ExpandedMessagesModule from '../../../../contexts/ExpandedMessages'
import type { TicketThreadRegularMessageItem } from '../../../../hooks/messages/types'
import { TicketThreadItemTag } from '../../../../hooks/types'
import { render } from '../../../../tests/render.utils'
import { server } from '../../../../tests/server'
import type { DisplayedTicketThreadMessageItem } from '../../../TicketMessage/hooks/useDisplayedTicketMessage'
import type * as MessageAttachmentsModule from '../MessageAttachments'
import { MessageFooter } from '../MessageFooter'

type MessageFooterData =
    DisplayedTicketThreadMessageItem<TicketThreadRegularMessageItem>['data']

vi.mock('@repo/tickets', async () => {
    const actual = await vi.importActual<typeof TicketsModule>('@repo/tickets')

    return {
        ...actual,
        useCurrentUserLanguagePreferences: vi.fn(() => ({
            shouldShowTranslatedContent: () => true,
        })),
        useTicketMessageTranslations: vi.fn(),
        useTicketMessageDisplayState: vi.fn(),
    }
})

vi.mock('react-player', () => ({
    default: ({ url }: { url: string }) => <div>{`react-player:${url}`}</div>,
}))

vi.mock('../MessageAttachments', async () => {
    const actual = await vi.importActual<typeof MessageAttachmentsModule>(
        '../MessageAttachments',
    )

    return {
        ...actual,
        MessageAttachments: ({
            item,
        }: {
            item: TicketThreadRegularMessageItem
        }) => <div>{`attachments:${item.data.id}`}</div>,
    }
})

vi.mock('../TranslationsDropdown', () => ({
    TranslationsDropdown: ({
        messageId,
        ticketId,
    }: {
        messageId: number
        ticketId: number
    }) => <div>{`translations:${messageId}:${ticketId}`}</div>,
}))

const mockUseExpandedMessages = vi.spyOn(
    ExpandedMessagesModule,
    'useExpandedMessages',
)
const mockUseTicketMessageTranslations = vi.mocked(useTicketMessageTranslations)
const mockUseTicketMessageDisplayState = vi.mocked(useTicketMessageDisplayState)

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
            attachments: [],
            ...overrides,
        }) as MessageFooterData,
        datetime: '2024-03-21T11:00:00Z',
    } as TicketThreadRegularMessageItem
}

beforeEach(() => {
    toggleMessage.mockReset()
    server.use(
        mockGetTicketHandler(async ({ params }) =>
            HttpResponse.json(
                mockTicket({
                    id: Number(params?.id ?? 1),
                    language: 'fr',
                }),
            ),
        ).handler,
    )
    mockUseExpandedMessages.mockReturnValue({
        expandedMessageIds: [],
        toggleMessage,
        isMessageExpanded: vi.fn(() => false),
    })
    mockUseTicketMessageTranslations.mockReturnValue({
        ticketMessagesTranslationMap: {},
        getMessageTranslation: vi.fn(() => mockTicketMessageTranslation()),
    } as ReturnType<typeof useTicketMessageTranslations>)
    mockUseTicketMessageDisplayState.mockReturnValue({
        display: DisplayedContent.Original,
        fetchingState: FetchingState.Completed,
    } as ReturnType<typeof useTicketMessageDisplayState>)
})

describe('MessageFooter', () => {
    it('renders attachments and translations dropdown for messages with id', () => {
        render(
            <MessageFooter
                item={makeItem({
                    attachments: [
                        {
                            url: 'https://example.com/file.pdf',
                            name: 'file.pdf',
                            content_type: 'application/pdf',
                            public: true,
                        },
                    ],
                })}
            />,
        )

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

        expect(screen.getByText('translations:456:123')).toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('returns null when no footer section is available', () => {
        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: {},
            getMessageTranslation: vi.fn(),
        } as ReturnType<typeof useTicketMessageTranslations>)
        mockUseTicketMessageDisplayState.mockReturnValue({
            fetchingState: FetchingState.Idle,
        } as ReturnType<typeof useTicketMessageDisplayState>)

        const { container } = render(
            <MessageFooter
                item={makeItem({
                    attachments: [],
                })}
            />,
        )

        expect(container).toBeEmptyDOMElement()
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
