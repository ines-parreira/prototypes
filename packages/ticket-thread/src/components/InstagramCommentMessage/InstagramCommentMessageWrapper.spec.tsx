import { act, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import {
    mockGetCustomerHandler,
    mockGetUserAvailabilityHandler,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'
import type * as HelpdeskQueriesModule from '@gorgias/helpdesk-queries'
import { useGetTicketMessage } from '@gorgias/helpdesk-queries'

import { TicketThreadWidthContext } from '../../contexts/TicketThreadWidth'
import type { TicketThreadSocialMediaInstagramCommentItem } from '../../hooks/messages/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { getCurrentUserHandler } from '../../tests/getCurrentUser.mock'
import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'
import type { LegacyBridgeContextType } from '../../utils/LegacyBridge/types'
import { useTicketThreadLegacyBridge } from '../../utils/LegacyBridge/useTicketThreadLegacyBridge'
import { InstagramCommentMessageWrapper } from './InstagramCommentMessageWrapper'

vi.mock('../../utils/LegacyBridge/useTicketThreadLegacyBridge', () => ({
    useTicketThreadLegacyBridge: vi.fn(),
}))

vi.mock('@gorgias/helpdesk-queries', async (importOriginal) => {
    const actual = await importOriginal<typeof HelpdeskQueriesModule>()
    return { ...actual, useGetTicketMessage: vi.fn() }
})

const mockUseGetTicketMessage = vi.mocked(useGetTicketMessage)

const mockUseTicketThreadLegacyBridge = vi.mocked(useTicketThreadLegacyBridge)

const onInstagramCommentPrivateReply = vi.fn()
const onInstagramCommentHideComment = vi.fn()

beforeEach(() => {
    vi.clearAllMocks()
    server.use(
        getCurrentUserHandler().handler,
        http.get('/api/users/:id', () => HttpResponse.json({})),
        mockGetCustomerHandler().handler,
        mockGetUserAvailabilityHandler().handler,
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
        onInstagramCommentPrivateReply,
        onInstagramCommentHideComment,
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
    source: { type: 'instagram-comment' },
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
): TicketThreadSocialMediaInstagramCommentItem {
    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaInstagramComment,
        data: {
            ...baseMessageData,
            ...overrides,
        } as TicketThreadSocialMediaInstagramCommentItem['data'],
        datetime: baseMessageData.created_datetime,
    }
}

describe('InstagramCommentMessageWrapper', () => {
    describe('inbound comment (from_agent: false)', () => {
        it('calls onInstagramCommentPrivateReply with body_text as commentMessage', async () => {
            const { user } = render(
                <InstagramCommentMessageWrapper
                    item={makeItem({ from_agent: false })}
                />,
            )

            await act(() =>
                user.click(
                    screen.getByRole('radio', {
                        name: 'Reply by Instagram DM',
                    }),
                ),
            )

            expect(onInstagramCommentPrivateReply).toHaveBeenCalledOnce()
            expect(onInstagramCommentPrivateReply).toHaveBeenCalledWith(
                expect.objectContaining({
                    commentMessage: 'Original body text',
                    integrationId: 7,
                    messageId: 'msg-123',
                    ticketMessageId: 42,
                    ticketId: 99,
                }),
            )
        })

        it('does not use stripped_text as commentMessage for private reply', async () => {
            const { user } = render(
                <InstagramCommentMessageWrapper
                    item={makeItem({ from_agent: false })}
                />,
            )

            await act(() =>
                user.click(
                    screen.getByRole('radio', {
                        name: 'Reply by Instagram DM',
                    }),
                ),
            )

            expect(onInstagramCommentPrivateReply).toHaveBeenCalledWith(
                expect.not.objectContaining({
                    commentMessage: 'Stripped text',
                }),
            )
        })

        it('calls onInstagramCommentHideComment when hide comment is clicked', async () => {
            const { user } = render(
                <InstagramCommentMessageWrapper
                    item={makeItem({ from_agent: false })}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('radio', { name: 'Hide comment' })),
            )

            expect(onInstagramCommentHideComment).toHaveBeenCalledOnce()
            expect(onInstagramCommentHideComment).toHaveBeenCalledWith(
                expect.objectContaining({
                    integrationId: 7,
                    messageId: 'msg-123',
                    ticketId: 99,
                    shouldHide: true,
                }),
            )
        })

        it('calls onInstagramCommentHideComment with shouldHide: false for a hidden comment', async () => {
            const { user } = render(
                <InstagramCommentMessageWrapper
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

            expect(onInstagramCommentHideComment).toHaveBeenCalledWith(
                expect.objectContaining({ shouldHide: false }),
            )
        })

        it('shows full action set: private reply, hide, copy', () => {
            render(
                <InstagramCommentMessageWrapper
                    item={makeItem({ from_agent: false })}
                />,
            )

            expect(
                screen.getByRole('radio', { name: 'Reply by Instagram DM' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: 'Hide comment' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Copy message' }),
            ).toBeInTheDocument()
        })
    })

    describe('responded via Instagram Direct Message', () => {
        it('shows "replied via Instagram Direct Message" in the agent bubble when meta.replied_by is set', () => {
            render(
                <InstagramCommentMessageWrapper
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
                screen.getByText('replied via Instagram Direct Message'),
            ).toBeInTheDocument()
        })
    })

    describe('compact mode', () => {
        it('opens the intents panel when Intents is selected from the compact menu', async () => {
            const { user } = render(
                <TicketThreadWidthContext.Provider
                    value={{ containerWidth: 1 }}
                >
                    <InstagramCommentMessageWrapper
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
        it('shows only copy button', () => {
            render(
                <InstagramCommentMessageWrapper
                    item={makeItem({ from_agent: true })}
                />,
            )

            expect(
                screen.getByRole('button', { name: 'Copy message' }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('radio', { name: 'Reply by Instagram DM' }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('radio', { name: 'Hide comment' }),
            ).not.toBeInTheDocument()
        })

        it('does not trigger private reply callback when copy is clicked', async () => {
            const { user } = render(
                <InstagramCommentMessageWrapper
                    item={makeItem({ from_agent: true })}
                />,
            )

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'Copy message' }),
                ),
            )

            expect(onInstagramCommentPrivateReply).not.toHaveBeenCalled()
        })
    })
})
