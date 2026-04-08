import { act, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'
import type * as HelpdeskQueriesModule from '@gorgias/helpdesk-queries'
import { useGetTicketMessage } from '@gorgias/helpdesk-queries'

import type { TicketThreadSocialMediaFacebookCommentItem } from '../../hooks/messages/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { getCurrentUserHandler } from '../../tests/getCurrentUser.mock'
import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'
import type { LegacyBridgeContextType } from '../../utils/LegacyBridge/types'
import { useTicketThreadLegacyBridge } from '../../utils/LegacyBridge/useTicketThreadLegacyBridge'
import { FacebookCommentMessageWrapper } from './FacebookCommentMessageWrapper'

vi.mock('../../utils/LegacyBridge/useTicketThreadLegacyBridge', () => ({
    useTicketThreadLegacyBridge: vi.fn(),
}))

vi.mock('@gorgias/helpdesk-queries', async (importOriginal) => {
    const actual = await importOriginal<typeof HelpdeskQueriesModule>()
    return { ...actual, useGetTicketMessage: vi.fn() }
})

const mockUseGetTicketMessage = vi.mocked(useGetTicketMessage)

const mockUseTicketThreadLegacyBridge = vi.mocked(useTicketThreadLegacyBridge)

const onFacebookCommentPrivateReply = vi.fn()
const onFacebookCommentHideComment = vi.fn()
const onFacebookCommentLike = vi.fn()

beforeEach(() => {
    vi.clearAllMocks()
    server.use(
        getCurrentUserHandler().handler,
        http.get('/api/users/:id', () => HttpResponse.json({})),
    )
    mockUseGetTicketMessage.mockReturnValue({ data: undefined } as ReturnType<
        typeof useGetTicketMessage
    >)
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
                screen.getByRole('radio', { name: 'Private reply' }),
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
                    screen.getByRole('radio', { name: 'Private reply' }),
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
                screen.queryByRole('radio', { name: 'Private reply' }),
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
