import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'

import type { TicketThreadSocialMediaFacebookPostItem } from '../../hooks/messages/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { getCurrentUserHandler } from '../../tests/getCurrentUser.mock'
import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { useTicketThreadLegacyBridge } from '../../utils/LegacyBridge/useTicketThreadLegacyBridge'
import { FacebookPostMessage } from './FacebookPostMessage'

vi.mock('../../utils/LegacyBridge/useTicketThreadLegacyBridge', () => ({
    useTicketThreadLegacyBridge: vi.fn(),
}))

const mockUseTicketThreadLegacyBridge = vi.mocked(useTicketThreadLegacyBridge)

beforeEach(() => {
    window.GORGIAS_STATE = {
        currentAccount: {
            domain: 'acme',
        },
    }
    server.use(
        getCurrentUserHandler().handler,
        http.get('/api/users/:id', () => HttpResponse.json({})),
    )
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
