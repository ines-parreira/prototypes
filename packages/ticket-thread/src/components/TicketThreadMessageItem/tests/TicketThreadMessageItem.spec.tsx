import type * as TicketsModule from '@repo/tickets'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import {
    mockGetTicketHandler,
    mockTicket,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'

import type { TicketThreadMessageItem } from '../../../hooks/messages/types'
import { useTicketThreadDateTimeFormat } from '../../../hooks/shared/useTicketThreadDateTimeFormat'
import { TicketThreadItemTag } from '../../../hooks/types'
import { getCurrentUserHandler } from '../../../tests/getCurrentUser.mock'
import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import type { LegacyBridgeContextType } from '../../../utils/LegacyBridge'
import { useTicketThreadLegacyBridge } from '../../../utils/LegacyBridge'
import { TicketThreadMessageItem as TicketThreadMessageItemComponent } from '../TicketThreadMessageItem'

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

vi.mock('../../../utils/LegacyBridge', () => ({
    useTicketThreadLegacyBridge: vi.fn(),
}))

vi.mock('../../../hooks/shared/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(),
}))

const mockUseTicketThreadDateTimeFormat = vi.mocked(
    useTicketThreadDateTimeFormat,
)

const mockUseTicketThreadLegacyBridge = vi.mocked(useTicketThreadLegacyBridge)
const renderAiAgentReasoning = vi.fn(() => <div>AiAgentReasoningSlot</div>)

function createLegacyBridgeValue(
    overrides: Partial<LegacyBridgeContextType> = {},
): LegacyBridgeContextType {
    return {
        currentTicketShoppingAssistantData: {
            influencedOrders: [],
            shopifyOrders: [],
            shopifyIntegrations: [],
        },
        currentTicketRuleSuggestionData: {
            shouldDisplayDemoSuggestion: false,
        },
        legacyActions: {
            deleteTicketPendingMessage: vi.fn(),
            retrySubmitTicketMessage: vi.fn(),
        },
        legacyState: {
            newMessage: {
                isSubmittingMessage: false,
            },
        },
        renderAiAgentReasoning: undefined,
        ...overrides,
    }
}

beforeEach(() => {
    renderAiAgentReasoning.mockClear()
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
    mockUseTicketThreadLegacyBridge.mockReturnValue(createLegacyBridgeValue())
})

const messageData = mockTicketMessage({
    id: 1,
    body_html: null,
    stripped_html: null,
    stripped_text: 'hello',
    body_text: 'hello',
})

function renderItem(item: TicketThreadMessageItem) {
    return render(<TicketThreadMessageItemComponent item={item} />)
}

describe('TicketThreadMessageItem', () => {
    const messageTags = [
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
            tag: TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage,
            label: 'Instagram DM',
        },
        {
            tag: TicketThreadItemTag.Messages.SocialMediaInstagramMedia,
            label: 'Instagram media',
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
    ]

    it.each(messageTags)('renders $label item', ({ tag }) => {
        renderItem({
            _tag: tag,
            data: messageData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText('hello')).toBeInTheDocument()
    })

    it('renders AI agent message item', () => {
        mockUseTicketThreadLegacyBridge.mockReturnValue(
            createLegacyBridgeValue({
                renderAiAgentReasoning,
            }),
        )

        renderItem({
            _tag: TicketThreadItemTag.Messages.AiAgentMessage,
            data: messageData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('hello')).toBeInTheDocument()
        expect(screen.getByText('AiAgentReasoningSlot')).toBeInTheDocument()
        expect(renderAiAgentReasoning).toHaveBeenCalledWith({
            message: messageData,
        })
    })

    it('renders AI agent internal note item', () => {
        mockUseTicketThreadLegacyBridge.mockReturnValue(
            createLegacyBridgeValue({
                renderAiAgentReasoning,
            }),
        )

        renderItem({
            _tag: TicketThreadItemTag.Messages.AiAgentInternalNote,
            data: messageData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('hello')).toBeInTheDocument()
        expect(
            screen.queryByText('AiAgentReasoningSlot'),
        ).not.toBeInTheDocument()
        expect(renderAiAgentReasoning).not.toHaveBeenCalled()
    })

    it('renders AI agent draft message item', () => {
        mockUseTicketThreadLegacyBridge.mockReturnValue(
            createLegacyBridgeValue({
                renderAiAgentReasoning,
            }),
        )

        renderItem({
            _tag: TicketThreadItemTag.Messages.AiAgentDraftMessage,
            data: messageData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('hello')).toBeInTheDocument()
        expect(
            screen.queryByText('AiAgentReasoningSlot'),
        ).not.toBeInTheDocument()
        expect(renderAiAgentReasoning).not.toHaveBeenCalled()
    })

    it('renders AI agent trial message item', () => {
        mockUseTicketThreadLegacyBridge.mockReturnValue(
            createLegacyBridgeValue({
                renderAiAgentReasoning,
            }),
        )

        renderItem({
            _tag: TicketThreadItemTag.Messages.AiAgentTrialMessage,
            data: messageData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('hello')).toBeInTheDocument()
        expect(
            screen.queryByText('AiAgentReasoningSlot'),
        ).not.toBeInTheDocument()
        expect(renderAiAgentReasoning).not.toHaveBeenCalled()
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
            screen
                .getByText(messageData.body_text!)
                .closest('[style*="justify-content"]'),
        ).toHaveStyle({
            justifyContent: 'flex-end',
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
            screen
                .getByText(messageData.body_text!)
                .closest('[style*="justify-content"]'),
        ).toHaveStyle({
            justifyContent: 'flex-start',
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
            _tag: TicketThreadItemTag.Messages.GroupedMessages,
            data: mergedData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText(JSON.stringify(mergedData))).toBeInTheDocument()
    })

    it('renders WhatsApp message with sender name', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage,
            data: {
                ...messageData,
                source: { type: 'whatsapp-message' },
                sender: {
                    name: 'Alice',
                    email: 'alice@example.com',
                    meta: null,
                },
                from_agent: false,
            },
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    it('shows copy and intents buttons for inbound WhatsApp messages', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage,
            data: {
                ...messageData,
                source: { type: 'whatsapp-message' },
                from_agent: false,
            },
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(
            screen.getByRole('button', { name: 'Message intent' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Copy message' }),
        ).toBeInTheDocument()
    })

    it('renders Instagram comment with sender name', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramComment,
            data: {
                ...messageData,
                source: { type: 'instagram-comment' },
                sender: {
                    id: 1,
                    name: 'Alice',
                    email: 'alice@example.com',
                    meta: null,
                },
                from_agent: false,
            },
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    it('shows action buttons for inbound Instagram comments', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramComment,
            data: {
                ...messageData,
                source: { type: 'instagram-comment' },
                sender: {
                    id: 1,
                    name: 'Alice',
                    email: 'alice@example.com',
                    meta: null,
                },
                from_agent: false,
            },
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(
            screen.getByRole('radio', { name: 'Private reply' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: 'Hide comment' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Copy message' }),
        ).toBeInTheDocument()
    })

    it('renders Instagram media with sender name', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramMedia,
            data: {
                ...messageData,
                source: { type: 'instagram-media' },
                sender: {
                    name: 'Alice',
                    email: 'alice@example.com',
                    meta: null,
                },
                from_agent: false,
            },
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    it('shows copy and intents buttons for inbound Instagram media', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramMedia,
            data: {
                ...messageData,
                source: { type: 'instagram-media' },
                from_agent: false,
            },
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(
            screen.getByRole('button', { name: 'Message intent' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Copy message' }),
        ).toBeInTheDocument()
    })

    it('shows only copy button for outbound Instagram media', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramMedia,
            data: {
                ...messageData,
                source: { type: 'instagram-media' },
                from_agent: true,
            },
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(
            screen.queryByRole('button', { name: 'Message intent' }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Copy message' }),
        ).toBeInTheDocument()
    })

    it('shows only copy button for outbound Instagram comments', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramComment,
            data: {
                ...messageData,
                source: { type: 'instagram-comment' },
                sender: {
                    id: 1,
                    name: 'Alice',
                    email: 'alice@example.com',
                    meta: null,
                },
                from_agent: true,
            },
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(
            screen.queryByRole('radio', { name: 'Private reply' }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Copy message' }),
        ).toBeInTheDocument()
    })

    it('renders Instagram DM with message body', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages
                .SocialMediaInstagramDirectMessage,
            data: {
                ...messageData,
                sender: {
                    name: 'Alice',
                    email: 'alice@example.com',
                    meta: null,
                },
                from_agent: false,
            },
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText('hello')).toBeInTheDocument()
    })

    it('renders Instagram story mention', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention,
            data: {
                ...messageData,
                sender: {
                    name: 'Alice',
                    email: 'alice@example.com',
                    meta: null,
                },
                from_agent: false,
            },
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText('Story mention')).toBeInTheDocument()
    })

    it('renders Instagram story reply', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply,
            data: {
                ...messageData,
                sender: {
                    name: 'Alice',
                    email: 'alice@example.com',
                    meta: null,
                },
                from_agent: false,
            },
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(screen.getByText('Story reply')).toBeInTheDocument()
    })

    it('shows only copy button for outbound WhatsApp messages', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage,
            data: {
                ...messageData,
                source: { type: 'whatsapp-message' },
                from_agent: true,
            },
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadMessageItem)

        expect(
            screen.queryByRole('button', { name: 'Message intent' }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Copy message' }),
        ).toBeInTheDocument()
    })
})
