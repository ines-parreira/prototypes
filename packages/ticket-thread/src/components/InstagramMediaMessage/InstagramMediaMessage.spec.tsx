import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'

import type { TicketThreadSocialMediaInstagramMediaItem } from '../../hooks/messages/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { getCurrentUserHandler } from '../../tests/getCurrentUser.mock'
import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { useTicketThreadLegacyBridge } from '../../utils/LegacyBridge/useTicketThreadLegacyBridge'
import { InstagramMediaMessage } from './InstagramMediaMessage'

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
    source: { type: 'instagram-media' },
    from_agent: false,
})

function makeItem(
    overrides: Partial<typeof baseMessageData> = {},
): TicketThreadSocialMediaInstagramMediaItem {
    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaInstagramMedia,
        data: {
            ...baseMessageData,
            ...overrides,
        } as TicketThreadSocialMediaInstagramMediaItem['data'],
        datetime: baseMessageData.created_datetime,
    }
}

describe('InstagramMediaMessage', () => {
    describe('mention type', () => {
        it('shows story mention text and link for instagram-mention-media with media_type STORY', () => {
            render(
                <InstagramMediaMessage
                    item={makeItem({
                        source: {
                            type: 'instagram-mention-media',
                            extra: {
                                permalink: 'https://instagram.com/story/123',
                                media_type: 'STORY',
                            },
                        } as any,
                    })}
                />,
            )

            expect(
                screen.getByText('Mentioned you in a story'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: 'View story' }),
            ).toBeInTheDocument()
        })

        it('shows post mention text and link for instagram-mention-media with non-story media_type', () => {
            render(
                <InstagramMediaMessage
                    item={makeItem({
                        source: {
                            type: 'instagram-mention-media',
                            extra: {
                                permalink: 'https://instagram.com/p/abc',
                                media_type: 'IMAGE',
                            },
                        } as any,
                    })}
                />,
            )

            expect(
                screen.getByText('Mentioned you in a post'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: 'View post' }),
            ).toBeInTheDocument()
        })

        it('shows comment mention text without a link for instagram-mention-comment', () => {
            render(
                <InstagramMediaMessage
                    item={makeItem({
                        source: {
                            type: 'instagram-mention-comment',
                            extra: { media_id: '123' },
                        } as any,
                    })}
                />,
            )

            expect(
                screen.getByText('Mentioned you in a comment'),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('link', { name: 'View comment' }),
            ).not.toBeInTheDocument()
        })

        it('shows mention text without a link when permalink is absent', () => {
            render(
                <InstagramMediaMessage
                    item={makeItem({
                        source: {
                            type: 'instagram-mention-media',
                            extra: { media_type: 'STORY' },
                        } as any,
                    })}
                />,
            )

            expect(
                screen.getByText('Mentioned you in a story'),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('link', { name: 'View story' }),
            ).not.toBeInTheDocument()
        })

        it('shows "view on Instagram" link for non-mention instagram-media with permalink', () => {
            render(
                <InstagramMediaMessage
                    item={makeItem({
                        source: {
                            type: 'instagram-media',
                            extra: {
                                permalink: 'https://instagram.com/p/xyz',
                            },
                        } as any,
                    })}
                />,
            )

            expect(
                screen.queryByText(/Mentioned you in/),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: 'Instagram' }),
            ).toBeInTheDocument()
        })

        it('does not show mention text for outbound agent replies', () => {
            render(
                <InstagramMediaMessage
                    item={makeItem({
                        from_agent: true,
                        source: {
                            type: 'instagram-mention-comment',
                            extra: {},
                        } as any,
                    })}
                />,
            )

            expect(
                screen.queryByText(/Mentioned you in/),
            ).not.toBeInTheDocument()
        })

        it('shows nothing when non-mention source has no permalink', () => {
            render(
                <InstagramMediaMessage
                    item={makeItem({
                        source: { type: 'instagram-media' } as any,
                    })}
                />,
            )

            expect(
                screen.queryByText(/Mentioned you in/),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('link', { name: 'Instagram' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('image attachments', () => {
        it('renders an image with the attachment name as alt text', () => {
            render(
                <InstagramMediaMessage
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

        it('falls back to "Instagram media" alt text when attachment has no name', () => {
            render(
                <InstagramMediaMessage
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

            expect(screen.getByAltText('Instagram media')).toBeInTheDocument()
        })

        it('renders multiple images when there are multiple image attachments', () => {
            render(
                <InstagramMediaMessage
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
                <InstagramMediaMessage
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
                <InstagramMediaMessage
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

        it('falls back to "Instagram video" label when attachment has no name', () => {
            render(
                <InstagramMediaMessage
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

            expect(screen.getByLabelText('Instagram video')).toBeInTheDocument()
        })

        it('renders multiple video elements for multiple video attachments', () => {
            render(
                <InstagramMediaMessage
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
                <InstagramMediaMessage
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
                <InstagramMediaMessage
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
                <InstagramMediaMessage
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
                screen.queryByAltText('Instagram media'),
            ).not.toBeInTheDocument()
        })
    })
})
