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
    mockGetCustomerHandler,
    mockGetTicketHandler,
    mockTicket,
    mockTicketMessage,
    mockTicketMessageTranslation,
} from '@gorgias/helpdesk-mocks'

import { useTicketThreadLegacyBridge } from '#legacy-bridge/useTicketThreadLegacyBridge'
import { getCurrentUserHandler } from '#tests/getCurrentUser.mock'
import { render } from '#tests/render.utils'
import { server } from '#tests/server'
import { TicketThreadItemTag } from '#thread/itemTags'
import type { TicketThreadSocialMediaFacebookPostItem } from '#ticket-messages/types'
import { FacebookPostMessage } from './FacebookPostMessage'

vi.mock('#legacy-bridge/useTicketThreadLegacyBridge', () => ({
    useTicketThreadLegacyBridge: vi.fn(),
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

const mockUseTicketThreadLegacyBridge = vi.mocked(useTicketThreadLegacyBridge)
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
        getCurrentUserHandler().handler,
        http.get('/api/users/:id', () => HttpResponse.json({})),
        mockGetTicketHandler(async ({ params }) =>
            HttpResponse.json(mockTicket({ id: Number(params?.id ?? 1) })),
        ).handler,
        mockGetCustomerHandler().handler,
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
    mockUseTicketThreadLegacyBridge.mockReturnValue({
        currentTicketShoppingAssistantData: {
            influencedOrders: [],
            shopifyOrders: [],
            shopifyIntegrations: [],
        },
        currentTicketRuleSuggestionData: { shouldDisplayDemoSuggestion: false },
        onInstagramCommentPrivateReply: vi.fn(),
        onInstagramCommentHideComment: vi.fn(),
        onFacebookCommentPrivateReply: vi.fn(),
        onFacebookCommentHideComment: vi.fn(),
        onFacebookCommentLike: vi.fn(),
        legacyActions: {
            deleteTicketPendingMessage: vi.fn(),
            retrySubmitTicketMessage: vi.fn(),
        },
        legacyState: {
            newMessage: {
                isSubmittingMessage: false,
            },
        },
    })
})

const baseMessageData = mockTicketMessage({
    id: 1,
    body_text: 'hello',
    stripped_text: 'hello',
    body_html: null,
    stripped_html: null,
    source: {
        type: 'facebook-post',
        extra: {
            page_id: '123',
            post_id: '123_456',
            permalink: 'https://facebook.com/123/posts/456',
        },
        from: { name: 'Alice' },
        to: [{ name: 'Page Name' }],
    },
    from_agent: false,
})

function makeItem(
    overrides: Partial<typeof baseMessageData> = {},
): TicketThreadSocialMediaFacebookPostItem {
    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaFacebookPost,
        data: {
            ...baseMessageData,
            ...overrides,
        } as TicketThreadSocialMediaFacebookPostItem['data'],
        datetime: baseMessageData.created_datetime,
    }
}

describe('FacebookPostMessage', () => {
    it('renders the translated post body when translation display is enabled', () => {
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
                    stripped_text: 'Translated Facebook post body',
                    stripped_html: null,
                }),
        } as unknown as ReturnType<typeof useTicketMessageTranslations>)

        render(<FacebookPostMessage item={makeItem()} />)

        expect(
            screen.getByText('Translated Facebook post body'),
        ).toBeInTheDocument()
        expect(screen.queryByText('hello')).not.toBeInTheDocument()
    })

    describe('view on Facebook link', () => {
        it('shows "view post on Facebook" link with permalink', () => {
            render(<FacebookPostMessage item={makeItem()} />)

            expect(
                screen.getByRole('link', { name: 'Facebook' }),
            ).toHaveAttribute('href', 'https://facebook.com/123/posts/456')
        })

        it('shows "view post on Facebook" text alongside the link', () => {
            render(<FacebookPostMessage item={makeItem()} />)

            expect(screen.getByText('view post on')).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: 'Facebook' }),
            ).toBeInTheDocument()
        })

        it('does not show the link when there is no permalink and no post id', () => {
            render(
                <FacebookPostMessage
                    item={makeItem({
                        source: {
                            type: 'facebook-mention-post',
                            extra: {},
                        } as any,
                    })}
                />,
            )

            expect(
                screen.queryByRole('link', { name: 'Facebook' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('image attachments', () => {
        it('renders an image with the attachment name as alt text', () => {
            render(
                <FacebookPostMessage
                    item={makeItem({
                        attachments: [
                            {
                                url: 'https://example.com/photo.jpg',
                                content_type: 'image/jpeg',
                                name: 'photo.jpg',
                            },
                        ],
                    })}
                />,
            )

            expect(screen.getByAltText('photo.jpg')).toBeInTheDocument()
        })

        it('falls back to "Facebook media" alt text when attachment has no name', () => {
            render(
                <FacebookPostMessage
                    item={makeItem({
                        attachments: [
                            {
                                url: 'https://example.com/photo.jpg',
                                content_type: 'image/jpeg',
                            },
                        ],
                    })}
                />,
            )

            expect(screen.getByAltText('Facebook media')).toBeInTheDocument()
        })

        it('renders multiple images when there are multiple image attachments', () => {
            render(
                <FacebookPostMessage
                    item={makeItem({
                        attachments: [
                            {
                                url: 'https://example.com/photo1.jpg',
                                content_type: 'image/jpeg',
                                name: 'photo1.jpg',
                            },
                            {
                                url: 'https://example.com/photo2.png',
                                content_type: 'image/png',
                                name: 'photo2.png',
                            },
                        ],
                    })}
                />,
            )

            expect(screen.getByAltText('photo1.jpg')).toBeInTheDocument()
            expect(screen.getByAltText('photo2.png')).toBeInTheDocument()
        })

        it('does not render an image for attachments without a url', () => {
            render(
                <FacebookPostMessage
                    item={makeItem({
                        attachments: [
                            {
                                url: '',
                                content_type: 'image/jpeg',
                                name: 'photo.jpg',
                            },
                        ],
                    })}
                />,
            )

            expect(screen.queryByAltText('photo.jpg')).not.toBeInTheDocument()
        })
    })

    describe('video attachments', () => {
        it('renders a video element with the attachment name as label', () => {
            render(
                <FacebookPostMessage
                    item={makeItem({
                        attachments: [
                            {
                                url: 'https://example.com/clip.mp4',
                                content_type: 'video/mp4',
                                name: 'clip.mp4',
                            },
                        ],
                    })}
                />,
            )

            expect(screen.getByLabelText('clip.mp4')).toBeInTheDocument()
        })

        it('falls back to "Facebook video" label when attachment has no name', () => {
            render(
                <FacebookPostMessage
                    item={makeItem({
                        attachments: [
                            {
                                url: 'https://example.com/clip.mp4',
                                content_type: 'video/mp4',
                            },
                        ],
                    })}
                />,
            )

            expect(screen.getByLabelText('Facebook video')).toBeInTheDocument()
        })

        it('renders multiple video elements for multiple video attachments', () => {
            render(
                <FacebookPostMessage
                    item={makeItem({
                        attachments: [
                            {
                                url: 'https://example.com/clip1.mp4',
                                content_type: 'video/mp4',
                                name: 'clip1.mp4',
                            },
                            {
                                url: 'https://example.com/clip2.mp4',
                                content_type: 'video/mp4',
                                name: 'clip2.mp4',
                            },
                        ],
                    })}
                />,
            )

            expect(screen.getByLabelText('clip1.mp4')).toBeInTheDocument()
            expect(screen.getByLabelText('clip2.mp4')).toBeInTheDocument()
        })

        it('does not render a video for attachments without a url', () => {
            render(
                <FacebookPostMessage
                    item={makeItem({
                        attachments: [
                            {
                                url: '',
                                content_type: 'video/mp4',
                                name: 'clip.mp4',
                            },
                        ],
                    })}
                />,
            )

            expect(screen.queryByLabelText('clip.mp4')).not.toBeInTheDocument()
        })
    })

    describe('mixed attachments', () => {
        it('renders both images and videos when both types are present', () => {
            render(
                <FacebookPostMessage
                    item={makeItem({
                        attachments: [
                            {
                                url: 'https://example.com/photo.jpg',
                                content_type: 'image/jpeg',
                                name: 'photo.jpg',
                            },
                            {
                                url: 'https://example.com/clip.mp4',
                                content_type: 'video/mp4',
                                name: 'clip.mp4',
                            },
                        ],
                    })}
                />,
            )

            expect(screen.getByAltText('photo.jpg')).toBeInTheDocument()
            expect(screen.getByLabelText('clip.mp4')).toBeInTheDocument()
        })

        it('does not render media image elements for video attachments', () => {
            render(
                <FacebookPostMessage
                    item={makeItem({
                        attachments: [
                            {
                                url: 'https://example.com/clip.mp4',
                                content_type: 'video/mp4',
                                name: 'clip.mp4',
                            },
                        ],
                    })}
                />,
            )

            expect(screen.queryByAltText('clip.mp4')).not.toBeInTheDocument()
            expect(
                screen.queryByAltText('Facebook media'),
            ).not.toBeInTheDocument()
        })
    })
})
