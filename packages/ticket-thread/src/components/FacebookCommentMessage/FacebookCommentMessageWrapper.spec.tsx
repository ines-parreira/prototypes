import type * as TicketsModule from '@repo/tickets'
import {
    DisplayedContent,
    useCurrentUserLanguagePreferences,
    useTicketMessageDisplayState,
    useTicketMessageTranslations,
} from '@repo/tickets'
import { act, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import {
    mockGetCustomerHandler,
    mockGetTicketHandler,
    mockGetTicketMessageHandler,
    mockGetUserAvailabilityHandler,
    mockTicket,
    mockTicketMessage,
    mockTicketMessageTranslation,
} from '@gorgias/helpdesk-mocks'

import { TicketThreadWidthContext } from '../../contexts/TicketThreadWidth'
import type { TicketThreadSocialMediaFacebookCommentItem } from '../../hooks/messages/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { getCurrentUserHandler } from '../../tests/getCurrentUser.mock'
import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

import type { LegacyBridgeContextType } from '../../utils/LegacyBridge/types'
import { useTicketThreadLegacyBridge } from '../../utils/LegacyBridge/useTicketThreadLegacyBridge'
import { FacebookCommentMessageWrapper } from './FacebookCommentMessageWrapper'

vi.mock('../../utils/LegacyBridge/useTicketThreadLegacyBridge', () => ({
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

const mockUseCurrentUserLanguagePreferences = vi.mocked(
    useCurrentUserLanguagePreferences,
)
const mockUseTicketMessageTranslations = vi.mocked(useTicketMessageTranslations)
const mockUseTicketMessageDisplayState = vi.mocked(useTicketMessageDisplayState)

const mockUseTicketThreadLegacyBridge = vi.mocked(useTicketThreadLegacyBridge)

const onFacebookCommentPrivateReply = vi.fn()
const onFacebookCommentHideComment = vi.fn()
const onFacebookCommentLike = vi.fn()

beforeEach(() => {
    vi.clearAllMocks()
    server.use(
        getCurrentUserHandler().handler,
        http.get('/api/users/:id', () => HttpResponse.json({})),
        mockGetTicketHandler(async ({ params }) =>
            HttpResponse.json(mockTicket({ id: Number(params?.id ?? 1) })),
        ).handler,
        mockGetTicketMessageHandler(async () => HttpResponse.json(null))
            .handler,
        mockGetCustomerHandler().handler,
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
    const legacyBridgeValue: LegacyBridgeContextType = {
        currentTicketShoppingAssistantData: {
            influencedOrders: [],
            shopifyOrders: [],
            shopifyIntegrations: [],
        },
        currentTicketRuleSuggestionData: { shouldDisplayDemoSuggestion: false },
        onInstagramCommentPrivateReply: vi.fn(),
        onInstagramCommentHideComment: vi.fn(),
        onFacebookCommentPrivateReply,
        onFacebookCommentHideComment,
        onFacebookCommentLike,
        legacyActions: {
            deleteTicketPendingMessage: vi.fn(),
            retrySubmitTicketMessage: vi.fn(),
        },
        legacyState: {
            newMessage: {
                isSubmittingMessage: false,
            },
        },
    }

    mockUseTicketThreadLegacyBridge.mockReturnValue(legacyBridgeValue)
})

const baseMessageData = mockTicketMessage({
    id: 42,
    body_text: 'Original body text',
    stripped_text: 'Stripped text',
    body_html: null,
    stripped_html: null,
    integration_id: 7,
    message_id: 'msg-123',
    ticket_id: 99,
    created_datetime: new Date().toISOString(),
    meta: null,
    source: { type: 'facebook-comment' },
    sender: {
        id: 1,
        name: 'Alice',
        firstname: 'Alice',
        lastname: '',
        email: 'alice@example.com',
        meta: null,
    },
})

function makeItem(
    overrides: Partial<typeof baseMessageData> = {},
): TicketThreadSocialMediaFacebookCommentItem {
    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaFacebookComment,
        data: {
            ...baseMessageData,
            ...overrides,
        } as TicketThreadSocialMediaFacebookCommentItem['data'],
        datetime: baseMessageData.created_datetime,
    }
}

describe('FacebookCommentMessageWrapper', () => {
    describe('inbound comment (from_agent: false)', () => {
        it('renders the translated comment body when translation display is enabled', () => {
            mockUseCurrentUserLanguagePreferences.mockReturnValue({
                shouldShowTranslatedContent: () => true,
            } as ReturnType<typeof useCurrentUserLanguagePreferences>)
            mockUseTicketMessageDisplayState.mockReturnValue({
                display: DisplayedContent.Translated,
            } as ReturnType<typeof useTicketMessageDisplayState>)
            mockUseTicketMessageTranslations.mockReturnValue({
                getMessageTranslation: () =>
                    mockTicketMessageTranslation({
                        ticket_message_id: 42,
                        stripped_text: 'Translated Facebook comment body',
                        stripped_html: null,
                    }),
            } as unknown as ReturnType<typeof useTicketMessageTranslations>)

            render(
                <FacebookCommentMessageWrapper
                    item={makeItem({ from_agent: false })}
                />,
            )

            expect(
                screen.getByText('Translated Facebook comment body'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Original body text'),
            ).not.toBeInTheDocument()
        })

        it('shows full action set: like, private reply, hide comment, copy', () => {
            render(
                <FacebookCommentMessageWrapper
                    item={makeItem({ from_agent: false })}
                />,
            )

            expect(
                screen.getByRole('radio', { name: 'Like' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', {
                    name: 'Reply by Facebook Messenger',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: 'Hide comment' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Copy message' }),
            ).toBeInTheDocument()
        })

        it('calls onFacebookCommentPrivateReply with correct params', async () => {
            const { user } = render(
                <FacebookCommentMessageWrapper
                    item={makeItem({ from_agent: false })}
                />,
            )

            await act(() =>
                user.click(
                    screen.getByRole('radio', {
                        name: 'Reply by Facebook Messenger',
                    }),
                ),
            )

            expect(onFacebookCommentPrivateReply).toHaveBeenCalledOnce()
            expect(onFacebookCommentPrivateReply).toHaveBeenCalledWith(
                expect.objectContaining({
                    commentMessage: 'Original body text',
                    integrationId: 7,
                    messageId: 'msg-123',
                    ticketMessageId: 42,
                    ticketId: 99,
                }),
            )
        })

        it('calls onFacebookCommentLike with shouldLike: true when not liked', async () => {
            const { user } = render(
                <FacebookCommentMessageWrapper
                    item={makeItem({ from_agent: false })}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('radio', { name: 'Like' })),
            )

            expect(onFacebookCommentLike).toHaveBeenCalledOnce()
            expect(onFacebookCommentLike).toHaveBeenCalledWith(
                expect.objectContaining({
                    integrationId: 7,
                    messageId: 'msg-123',
                    ticketId: 99,
                    shouldLike: true,
                }),
            )
        })

        it('calls onFacebookCommentHideComment with shouldHide: true', async () => {
            const { user } = render(
                <FacebookCommentMessageWrapper
                    item={makeItem({ from_agent: false })}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('radio', { name: 'Hide comment' })),
            )

            expect(onFacebookCommentHideComment).toHaveBeenCalledOnce()
            expect(onFacebookCommentHideComment).toHaveBeenCalledWith(
                expect.objectContaining({
                    integrationId: 7,
                    messageId: 'msg-123',
                    ticketId: 99,
                    shouldHide: true,
                }),
            )
        })

        it('calls onFacebookCommentHideComment with shouldHide: false for a hidden comment', async () => {
            const { user } = render(
                <FacebookCommentMessageWrapper
                    item={makeItem({
                        from_agent: false,
                        meta: {
                            hidden_datetime: '2024-01-01T00:00:00Z',
                        } as never,
                    })}
                />,
            )

            await act(() =>
                user.click(
                    screen.getByRole('radio', { name: 'Unhide comment' }),
                ),
            )

            expect(onFacebookCommentHideComment).toHaveBeenCalledWith(
                expect.objectContaining({ shouldHide: false }),
            )
        })

        it('shows "Liked" tag when comment is liked', () => {
            render(
                <FacebookCommentMessageWrapper
                    item={makeItem({
                        from_agent: false,
                        meta: {
                            facebook_reactions: {
                                page_reaction: { reaction_type: 'LIKE' },
                            },
                        } as never,
                    })}
                />,
            )

            expect(screen.getByText('Liked')).toBeInTheDocument()
        })

        it('calls onFacebookCommentLike with shouldLike: false when already liked', async () => {
            const { user } = render(
                <FacebookCommentMessageWrapper
                    item={makeItem({
                        from_agent: false,
                        meta: {
                            facebook_reactions: {
                                page_reaction: { reaction_type: 'LIKE' },
                            },
                        } as never,
                    })}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('radio', { name: 'Remove like' })),
            )

            expect(onFacebookCommentLike).toHaveBeenCalledWith(
                expect.objectContaining({ shouldLike: false }),
            )
        })
    })

    describe('compact mode', () => {
        it('opens the intents panel when Intents is selected from the compact menu', async () => {
            const { user } = render(
                <TicketThreadWidthContext.Provider
                    value={{ containerWidth: 1 }}
                >
                    <FacebookCommentMessageWrapper
                        item={makeItem({ from_agent: false })}
                    />
                </TicketThreadWidthContext.Provider>,
            )

            await user.click(
                screen.getByRole('radio', { name: 'More actions' }),
            )
            const menu = (await screen.findAllByRole('menu')).at(-1)!
            const intentsItem = await within(menu).findByRole('menuitem', {
                name: /Intents/i,
            })
            await user.click(intentsItem)

            await waitFor(() => {
                expect(screen.getByText('Message intents')).toBeInTheDocument()
            })
        })
    })

    describe('outbound comment (from_agent: true)', () => {
        it('shows like and copy buttons only', () => {
            render(
                <FacebookCommentMessageWrapper
                    item={makeItem({ from_agent: true })}
                />,
            )

            expect(
                screen.getByRole('radio', { name: 'Like' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Copy message' }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('radio', {
                    name: 'Reply by Facebook Messenger',
                }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('radio', { name: 'Hide comment' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('hidden comment', () => {
        it('shows hidden banner and unhide button', () => {
            render(
                <FacebookCommentMessageWrapper
                    item={makeItem({
                        from_agent: false,
                        meta: {
                            hidden_datetime: '2024-01-01T00:00:00Z',
                        } as never,
                    })}
                />,
            )

            expect(screen.getByText('Comment hidden')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Unhide comment' }),
            ).toBeInTheDocument()
        })
    })

    describe('deleted comment', () => {
        it('shows deleted banner', () => {
            render(
                <FacebookCommentMessageWrapper
                    item={makeItem({
                        from_agent: false,
                        meta: {
                            deleted_datetime: '2024-01-01T00:00:00Z',
                        } as never,
                    })}
                />,
            )

            expect(
                screen.getByText('Comment deleted on Facebook'),
            ).toBeInTheDocument()
        })
    })

    describe('responded via Messenger', () => {
        it('shows "replied via Messenger" in the agent bubble when meta.replied_by is set', () => {
            render(
                <FacebookCommentMessageWrapper
                    item={makeItem({
                        from_agent: false,
                        meta: {
                            replied_by: {
                                ticket_id: 100,
                                ticket_message_id: 200,
                            },
                        } as never,
                    })}
                />,
            )

            expect(
                screen.getByText('replied via Messenger'),
            ).toBeInTheDocument()
        })
    })
})
