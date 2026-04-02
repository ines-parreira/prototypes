import type * as TicketsModule from '@repo/tickets'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import {
    mockGetTicketHandler,
    mockTicket,
    mockTicketMessage,
    mockTicketMessageSource,
    mockTicketMessageSourceAddress,
    mockTicketMessageUserOrCustomer,
} from '@gorgias/helpdesk-mocks'

import {
    AI_AGENT_BOT_EMAILS,
    AI_AGENT_DRAFT_MESSAGE_TAG,
    AI_AGENT_TRIAL_MESSAGE_TAG,
} from '../../../hooks/messages/constants'
import type {
    TicketThreadGroupedMessagesItem,
    TicketThreadMessageItem,
    TicketThreadRegularMessageItem,
    TicketThreadSingleMessageItem,
} from '../../../hooks/messages/types'
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

type SingleMessageTag = TicketThreadSingleMessageItem['_tag']
type ItemForTag<TTag extends SingleMessageTag> = Extract<
    TicketThreadSingleMessageItem,
    { _tag: TTag }
>
type RegularMessageData = TicketThreadRegularMessageItem['data']

const HELLO_MESSAGE_TEXT = 'hello'
const MESSAGE_DATETIME = '2024-03-21T11:00:00Z'

const mockUseTicketThreadDateTimeFormat = vi.mocked(
    useTicketThreadDateTimeFormat,
)
const mockUseTicketThreadLegacyBridge = vi.mocked(useTicketThreadLegacyBridge)
const renderAiAgentReasoning = vi.fn(() => <div>AiAgentReasoningSlot</div>)

const aliceSender: RegularMessageData['sender'] = {
    ...mockTicketMessageUserOrCustomer({
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        meta: null,
    }),
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    meta: null,
}

const aiAgentSender: ItemForTag<
    typeof TicketThreadItemTag.Messages.AiAgentMessage
>['data']['sender'] = {
    ...mockTicketMessageUserOrCustomer({
        id: 2,
        name: 'AI Agent',
        email: AI_AGENT_BOT_EMAILS[0],
        meta: null,
    }),
    id: 2,
    name: 'AI Agent',
    email: AI_AGENT_BOT_EMAILS[0],
    meta: null,
}

const facebookCommentSource: ItemForTag<
    typeof TicketThreadItemTag.Messages.SocialMediaFacebookComment
>['data']['source'] = {
    ...mockTicketMessageSource({
        type: 'facebook-comment',
    }),
    type: 'facebook-comment',
}

const facebookPostSource: ItemForTag<
    typeof TicketThreadItemTag.Messages.SocialMediaFacebookPost
>['data']['source'] = {
    ...mockTicketMessageSource({
        type: 'facebook-post',
    }),
    type: 'facebook-post',
}

const facebookMessageSource: ItemForTag<
    typeof TicketThreadItemTag.Messages.SocialMediaFacebookMessage
>['data']['source'] = {
    ...mockTicketMessageSource({
        type: 'facebook-message',
    }),
    type: 'facebook-message',
}

const instagramCommentSource: ItemForTag<
    typeof TicketThreadItemTag.Messages.SocialMediaInstagramComment
>['data']['source'] = {
    ...mockTicketMessageSource({
        type: 'instagram-comment',
    }),
    type: 'instagram-comment',
}

const instagramDirectMessageSource: ItemForTag<
    typeof TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage
>['data']['source'] = {
    ...mockTicketMessageSource({
        type: 'instagram-direct-message',
    }),
    type: 'instagram-direct-message',
    from: {
        ...mockTicketMessageSourceAddress({
            name: 'Alice',
            address: null,
        }),
        name: 'Alice',
        address: null,
    },
    to: [
        {
            ...mockTicketMessageSourceAddress({
                name: 'Gorgias',
                address: null,
            }),
            name: 'Gorgias',
            address: null,
        },
    ],
}

const instagramMediaSource: ItemForTag<
    typeof TicketThreadItemTag.Messages.SocialMediaInstagramMedia
>['data']['source'] = {
    ...mockTicketMessageSource({
        type: 'instagram-media',
    }),
    type: 'instagram-media',
    from: {
        ...mockTicketMessageSourceAddress({
            name: 'Alice',
            address: null,
        }),
        name: 'Alice',
        address: null,
    },
    to: [
        {
            ...mockTicketMessageSourceAddress({
                name: 'Gorgias',
                address: null,
            }),
            name: 'Gorgias',
            address: null,
        },
    ],
    extra: null,
}

const twitterTweetSource: ItemForTag<
    typeof TicketThreadItemTag.Messages.SocialMediaTwitterTweet
>['data']['source'] = {
    ...mockTicketMessageSource({
        type: 'twitter-tweet',
    }),
    type: 'twitter-tweet',
}

const twitterDirectMessageSource: ItemForTag<
    typeof TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage
>['data']['source'] = {
    ...mockTicketMessageSource({
        type: 'twitter-direct-message',
    }),
    type: 'twitter-direct-message',
}

const whatsappSource: ItemForTag<
    typeof TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage
>['data']['source'] = {
    ...mockTicketMessageSource({
        type: 'whatsapp-message',
    }),
    type: 'whatsapp-message',
}

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

function createMessageData(
    overrides: Partial<RegularMessageData> = {},
): RegularMessageData {
    return {
        ...mockTicketMessage({
            id: 1,
            body_html: null,
            stripped_html: null,
            stripped_text: HELLO_MESSAGE_TEXT,
            body_text: HELLO_MESSAGE_TEXT,
            ...overrides,
        }),
        id: overrides.id ?? 1,
        body_html: overrides.body_html ?? null,
        stripped_html: overrides.stripped_html ?? null,
        stripped_text: overrides.stripped_text ?? HELLO_MESSAGE_TEXT,
        body_text: overrides.body_text ?? HELLO_MESSAGE_TEXT,
        channel: overrides.channel ?? 'email',
        from_agent: overrides.from_agent ?? false,
        via: overrides.via ?? 'email',
    }
}

function createGroupedMessagesItem(
    data: TicketThreadGroupedMessagesItem['data'],
): TicketThreadGroupedMessagesItem {
    return {
        _tag: TicketThreadItemTag.Messages.GroupedMessages,
        data,
        datetime: MESSAGE_DATETIME,
    }
}

function createMessageItem(
    overrides: Partial<RegularMessageData> = {},
): ItemForTag<typeof TicketThreadItemTag.Messages.Message> {
    return {
        _tag: TicketThreadItemTag.Messages.Message,
        data: createMessageData(overrides),
        datetime: MESSAGE_DATETIME,
    }
}

function createInternalNoteItem(
    overrides: Partial<
        ItemForTag<typeof TicketThreadItemTag.Messages.InternalNote>['data']
    > = {},
): ItemForTag<typeof TicketThreadItemTag.Messages.InternalNote> {
    return {
        _tag: TicketThreadItemTag.Messages.InternalNote,
        data: {
            ...createMessageData({
                public: false,
            }),
            ...overrides,
            public: false,
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createAiAgentMessageItem(
    overrides: Partial<
        ItemForTag<typeof TicketThreadItemTag.Messages.AiAgentMessage>['data']
    > = {},
): ItemForTag<typeof TicketThreadItemTag.Messages.AiAgentMessage> {
    const sender = overrides.sender ?? aiAgentSender

    return {
        _tag: TicketThreadItemTag.Messages.AiAgentMessage,
        data: {
            ...createMessageData({
                sender,
            }),
            ...overrides,
            sender,
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createAiAgentInternalNoteItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.AiAgentInternalNote
        >['data']
    > = {},
): ItemForTag<typeof TicketThreadItemTag.Messages.AiAgentInternalNote> {
    const sender = overrides.sender ?? aiAgentSender

    return {
        _tag: TicketThreadItemTag.Messages.AiAgentInternalNote,
        data: {
            ...createMessageData({
                sender,
                public: false,
            }),
            ...overrides,
            sender,
            public: false,
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createAiAgentDraftMessageItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.AiAgentDraftMessage
        >['data']
    > = {},
): ItemForTag<typeof TicketThreadItemTag.Messages.AiAgentDraftMessage> {
    const sender = overrides.sender ?? aiAgentSender
    const bodyHtml =
        overrides.body_html ?? `<div ${AI_AGENT_DRAFT_MESSAGE_TAG}></div>`

    return {
        _tag: TicketThreadItemTag.Messages.AiAgentDraftMessage,
        data: {
            ...createMessageData({
                sender,
                body_html: bodyHtml,
            }),
            ...overrides,
            sender,
            body_html: bodyHtml,
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createAiAgentTrialMessageItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.AiAgentTrialMessage
        >['data']
    > = {},
): ItemForTag<typeof TicketThreadItemTag.Messages.AiAgentTrialMessage> {
    const sender = overrides.sender ?? aiAgentSender
    const bodyHtml =
        overrides.body_html ?? `<div ${AI_AGENT_TRIAL_MESSAGE_TAG}></div>`

    return {
        _tag: TicketThreadItemTag.Messages.AiAgentTrialMessage,
        data: {
            ...createMessageData({
                sender,
                body_html: bodyHtml,
            }),
            ...overrides,
            sender,
            body_html: bodyHtml,
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createFacebookCommentItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.SocialMediaFacebookComment
        >['data']
    > = {},
): ItemForTag<typeof TicketThreadItemTag.Messages.SocialMediaFacebookComment> {
    const source = overrides.source ?? facebookCommentSource

    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaFacebookComment,
        data: {
            ...createMessageData({
                source,
            }),
            ...overrides,
            source,
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createFacebookPostItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.SocialMediaFacebookPost
        >['data']
    > = {},
): ItemForTag<typeof TicketThreadItemTag.Messages.SocialMediaFacebookPost> {
    const source = overrides.source ?? facebookPostSource

    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaFacebookPost,
        data: {
            ...createMessageData({
                source,
            }),
            ...overrides,
            source,
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createFacebookMessageItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.SocialMediaFacebookMessage
        >['data']
    > = {},
): ItemForTag<typeof TicketThreadItemTag.Messages.SocialMediaFacebookMessage> {
    const source = overrides.source ?? facebookMessageSource

    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaFacebookMessage,
        data: {
            ...createMessageData({
                source,
            }),
            ...overrides,
            source,
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createInstagramCommentItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.SocialMediaInstagramComment
        >['data']
    > = {},
): ItemForTag<typeof TicketThreadItemTag.Messages.SocialMediaInstagramComment> {
    const source = overrides.source ?? instagramCommentSource
    const sender = overrides.sender ?? aliceSender
    const fromAgent = overrides.from_agent ?? false

    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaInstagramComment,
        data: {
            ...createMessageData({
                source,
                sender,
                from_agent: fromAgent,
            }),
            ...overrides,
            source,
            sender,
            from_agent: fromAgent,
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createInstagramDirectMessageItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage
        >['data']
    > = {},
): ItemForTag<
    typeof TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage
> {
    const source = overrides.source ?? instagramDirectMessageSource
    const sender = overrides.sender ?? aliceSender
    const fromAgent = overrides.from_agent ?? false

    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage,
        data: {
            ...createMessageData({
                source,
                sender,
                from_agent: fromAgent,
            }),
            ...overrides,
            source,
            sender,
            from_agent: fromAgent,
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createInstagramMediaItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.SocialMediaInstagramMedia
        >['data']
    > = {},
): ItemForTag<typeof TicketThreadItemTag.Messages.SocialMediaInstagramMedia> {
    const source = overrides.source ?? instagramMediaSource
    const sender = overrides.sender ?? aliceSender
    const fromAgent = overrides.from_agent ?? false

    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaInstagramMedia,
        data: {
            ...createMessageData({
                source,
                sender,
                from_agent: fromAgent,
            }),
            ...overrides,
            source,
            sender,
            from_agent: fromAgent,
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createInstagramStoryMentionItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention
        >['data']
    > = {},
): ItemForTag<
    typeof TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention
> {
    const source = overrides.source ?? instagramDirectMessageSource
    const sender = overrides.sender ?? aliceSender
    const fromAgent = overrides.from_agent ?? false

    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention,
        data: {
            ...createMessageData({
                source,
                sender,
                from_agent: fromAgent,
            }),
            ...overrides,
            source,
            sender,
            from_agent: fromAgent,
            meta: { is_story_mention: true },
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createInstagramStoryReplyItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply
        >['data']
    > = {},
): ItemForTag<
    typeof TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply
> {
    const source = overrides.source ?? instagramDirectMessageSource
    const sender = overrides.sender ?? aliceSender
    const fromAgent = overrides.from_agent ?? false

    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply,
        data: {
            ...createMessageData({
                source,
                sender,
                from_agent: fromAgent,
            }),
            ...overrides,
            source,
            sender,
            from_agent: fromAgent,
            meta: { is_story_reply: true },
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createTwitterTweetItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.SocialMediaTwitterTweet
        >['data']
    > = {},
): ItemForTag<typeof TicketThreadItemTag.Messages.SocialMediaTwitterTweet> {
    const source = overrides.source ?? twitterTweetSource

    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaTwitterTweet,
        data: {
            ...createMessageData({
                source,
            }),
            ...overrides,
            source,
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createTwitterDirectMessageItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage
        >['data']
    > = {},
): ItemForTag<
    typeof TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage
> {
    const source = overrides.source ?? twitterDirectMessageSource

    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage,
        data: {
            ...createMessageData({
                source,
            }),
            ...overrides,
            source,
        },
        datetime: MESSAGE_DATETIME,
    }
}

function createWhatsAppMessageItem(
    overrides: Partial<
        ItemForTag<
            typeof TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage
        >['data']
    > = {},
): ItemForTag<typeof TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage> {
    const source = overrides.source ?? whatsappSource
    const fromAgent = overrides.from_agent ?? false

    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage,
        data: {
            ...createMessageData({
                source,
                from_agent: fromAgent,
            }),
            ...overrides,
            source,
            from_agent: fromAgent,
        },
        datetime: MESSAGE_DATETIME,
    }
}

function renderItem(item: TicketThreadMessageItem) {
    return render(<TicketThreadMessageItemComponent item={item} />)
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

describe('TicketThreadMessageItem', () => {
    const messageItems = [
        {
            label: 'Facebook comment',
            item: createFacebookCommentItem(),
        },
        {
            label: 'Facebook post',
            item: createFacebookPostItem(),
        },
        {
            label: 'Facebook message',
            item: createFacebookMessageItem(),
        },
        {
            label: 'Instagram DM',
            item: createInstagramDirectMessageItem(),
        },
        {
            label: 'Instagram media',
            item: createInstagramMediaItem(),
        },
        {
            label: 'Instagram story reply',
            item: createInstagramStoryReplyItem(),
        },
        {
            label: 'Twitter tweet',
            item: createTwitterTweetItem(),
        },
        {
            label: 'Twitter DM',
            item: createTwitterDirectMessageItem(),
        },
    ]

    const aiAgentErrorBannerItems = [
        {
            label: TicketThreadItemTag.Messages.AiAgentMessage,
            item: createAiAgentMessageItem({
                failed_datetime: '2024-03-21T11:05:00Z',
                last_sending_error: null,
            }),
        },
        {
            label: TicketThreadItemTag.Messages.AiAgentInternalNote,
            item: createAiAgentInternalNoteItem({
                failed_datetime: '2024-03-21T11:05:00Z',
                last_sending_error: null,
            }),
        },
        {
            label: TicketThreadItemTag.Messages.AiAgentDraftMessage,
            item: createAiAgentDraftMessageItem({
                failed_datetime: '2024-03-21T11:05:00Z',
                last_sending_error: null,
            }),
        },
        {
            label: TicketThreadItemTag.Messages.AiAgentTrialMessage,
            item: createAiAgentTrialMessageItem({
                failed_datetime: '2024-03-21T11:05:00Z',
                last_sending_error: null,
            }),
        },
    ]

    it.each(messageItems)('renders $label item', ({ item }) => {
        renderItem(item)

        expect(screen.getByText(HELLO_MESSAGE_TEXT)).toBeInTheDocument()
    })

    it('renders AI agent message item', () => {
        mockUseTicketThreadLegacyBridge.mockReturnValue(
            createLegacyBridgeValue({
                renderAiAgentReasoning,
            }),
        )

        const item = createAiAgentMessageItem()

        renderItem(item)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText(HELLO_MESSAGE_TEXT)).toBeInTheDocument()
        expect(screen.getByText('AiAgentReasoningSlot')).toBeInTheDocument()
        expect(renderAiAgentReasoning).toHaveBeenCalledWith({
            message: item.data,
        })
    })

    it('renders AI agent internal note item', () => {
        mockUseTicketThreadLegacyBridge.mockReturnValue(
            createLegacyBridgeValue({
                renderAiAgentReasoning,
            }),
        )

        renderItem(createAiAgentInternalNoteItem())

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText(HELLO_MESSAGE_TEXT)).toBeInTheDocument()
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

        renderItem(createAiAgentDraftMessageItem())

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText(HELLO_MESSAGE_TEXT)).toBeInTheDocument()
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

        renderItem(createAiAgentTrialMessageItem())

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText(HELLO_MESSAGE_TEXT)).toBeInTheDocument()
        expect(
            screen.queryByText('AiAgentReasoningSlot'),
        ).not.toBeInTheDocument()
        expect(renderAiAgentReasoning).not.toHaveBeenCalled()
    })

    it.each(aiAgentErrorBannerItems)(
        'renders the error banner for $label items',
        ({ item }) => {
            renderItem(item)

            expect(
                screen.getByText('This message was not sent.'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Cancel Message' }),
            ).toBeInTheDocument()
        },
    )

    it('aligns agent messages to the right', () => {
        const item = createMessageItem({
            channel: 'email',
            via: 'email',
            from_agent: true,
        })

        renderItem(item)

        expect(
            screen
                .getByText(item.data.body_text!)
                .closest('[style*="justify-content"]'),
        ).toHaveStyle({
            justifyContent: 'flex-end',
        })
    })

    it('aligns customer messages to the left', () => {
        const item = createMessageItem({
            channel: 'email',
            via: 'email',
            from_agent: false,
        })

        renderItem(item)

        expect(
            screen
                .getByText(item.data.body_text!)
                .closest('[style*="justify-content"]'),
        ).toHaveStyle({
            justifyContent: 'flex-start',
        })
    })

    it('renders message item', () => {
        renderItem(
            createMessageItem({
                stripped_text: HELLO_MESSAGE_TEXT,
            }),
        )

        expect(screen.getByText(HELLO_MESSAGE_TEXT)).toBeInTheDocument()
    })

    it('renders internal note item', () => {
        renderItem(
            createInternalNoteItem({
                stripped_text: HELLO_MESSAGE_TEXT,
            }),
        )

        expect(screen.getByText(HELLO_MESSAGE_TEXT)).toBeInTheDocument()
    })

    it('renders merged messages item', () => {
        const mergedData = [createMessageItem()]
        const item = createGroupedMessagesItem(mergedData)

        renderItem(item)

        expect(screen.getByText(JSON.stringify(mergedData))).toBeInTheDocument()
    })

    it('renders WhatsApp message with sender name', () => {
        renderItem(
            createWhatsAppMessageItem({
                sender: aliceSender,
            }),
        )

        expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    it('shows copy and intents buttons for inbound WhatsApp messages', () => {
        renderItem(
            createWhatsAppMessageItem({
                from_agent: false,
            }),
        )

        expect(
            screen.getByRole('button', { name: 'Message intent' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Copy message' }),
        ).toBeInTheDocument()
    })

    it('renders Instagram comment with sender name', () => {
        renderItem(createInstagramCommentItem())

        expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    it('shows action buttons for inbound Instagram comments', () => {
        renderItem(
            createInstagramCommentItem({
                from_agent: false,
            }),
        )

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
        renderItem(createInstagramMediaItem())

        expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    it('shows copy and intents buttons for inbound Instagram media', () => {
        renderItem(
            createInstagramMediaItem({
                from_agent: false,
            }),
        )

        expect(
            screen.getByRole('button', { name: 'Message intent' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Copy message' }),
        ).toBeInTheDocument()
    })

    it('shows only copy button for outbound Instagram media', () => {
        renderItem(
            createInstagramMediaItem({
                from_agent: true,
            }),
        )

        expect(
            screen.queryByRole('button', { name: 'Message intent' }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Copy message' }),
        ).toBeInTheDocument()
    })

    it('shows only copy button for outbound Instagram comments', () => {
        renderItem(
            createInstagramCommentItem({
                from_agent: true,
            }),
        )

        expect(
            screen.queryByRole('radio', { name: 'Private reply' }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Copy message' }),
        ).toBeInTheDocument()
    })

    it('renders Instagram DM with message body', () => {
        renderItem(createInstagramDirectMessageItem())

        expect(screen.getByText(HELLO_MESSAGE_TEXT)).toBeInTheDocument()
    })

    it('renders Instagram story mention', () => {
        renderItem(createInstagramStoryMentionItem())

        expect(screen.getByText('Story mention')).toBeInTheDocument()
    })

    it('renders Instagram story reply', () => {
        renderItem(createInstagramStoryReplyItem())

        expect(screen.getByText('Story reply')).toBeInTheDocument()
    })

    it('shows only copy button for outbound WhatsApp messages', () => {
        renderItem(
            createWhatsAppMessageItem({
                from_agent: true,
            }),
        )

        expect(
            screen.queryByRole('button', { name: 'Message intent' }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Copy message' }),
        ).toBeInTheDocument()
    })
})
