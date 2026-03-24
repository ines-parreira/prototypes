import { act, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'

import type { TicketThreadSocialMediaInstagramCommentItem } from '../../hooks/messages/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { getCurrentUserHandler } from '../../tests/getCurrentUser.mock'
import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { useTicketThreadLegacyBridge } from '../../utils/LegacyBridge/useTicketThreadLegacyBridge'
import { InstagramCommentMessageWrapper } from './InstagramCommentMessageWrapper'

vi.mock('../../utils/LegacyBridge/useTicketThreadLegacyBridge', () => ({
    useTicketThreadLegacyBridge: vi.fn(),
}))

const mockUseTicketThreadLegacyBridge = vi.mocked(useTicketThreadLegacyBridge)

const onInstagramCommentPrivateReply = vi.fn()
const onInstagramCommentHideComment = vi.fn()

beforeEach(() => {
    vi.clearAllMocks()
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
        onInstagramCommentPrivateReply,
        onInstagramCommentHideComment,
    })
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
                    screen.getByRole('radio', { name: 'Private reply' }),
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
                    screen.getByRole('radio', { name: 'Private reply' }),
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
                screen.getByRole('radio', { name: 'Private reply' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: 'Hide comment' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Copy message' }),
            ).toBeInTheDocument()
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
                screen.queryByRole('radio', { name: 'Private reply' }),
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
