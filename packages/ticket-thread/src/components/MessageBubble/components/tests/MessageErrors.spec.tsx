import { screen, within } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockDeleteTicketMessageHandler,
    mockTicketMessage,
    mockUpdateTicketMessageHandler,
    mockUpdateTicketMessageResponse,
} from '@gorgias/helpdesk-mocks'

import { server } from '../../../../tests/server'

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

import { render } from '../../../../tests/render.utils'
import type { LegacyBridgeActions } from '../../../../utils/LegacyBridge'
import { MessageErrors } from '../MessageErrors'

function makeLegacyActions(): LegacyBridgeActions {
    return {
        deleteTicketPendingMessage: vi.fn(),
        retrySubmitTicketMessage: vi.fn(),
        undoTicketPendingMessage: vi.fn(),
    }
}

describe('MessageErrors', () => {
    beforeEach(() => {
        server.use(
            mockUpdateTicketMessageHandler(async () =>
                HttpResponse.json(mockUpdateTicketMessageResponse()),
            ).handler,
            mockDeleteTicketMessageHandler(async () => new HttpResponse(null))
                .handler,
        )
    })

    it('renders the Yotpo duplicate comment message without mutating retry state', () => {
        const message = mockTicketMessage({
            failed_datetime: '2024-03-21T11:00:00Z',
            is_retriable: true,
            last_sending_error: {
                error: 'Review already has a comment',
            },
            source: {
                type: 'yotpo-review-public-comment',
            },
        })

        render(<MessageErrors message={message} ticketId={123} />)

        expect(
            screen.getByText(
                /this comment can not be sent as this review has already received a comment from your account/i,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'Comment guide' }),
        ).toHaveAttribute(
            'href',
            'https://www.yotpo.com/blog/comments-complete-guide/',
        )
        expect(
            screen.queryByRole('button', { name: 'Retry' }),
        ).not.toBeInTheDocument()
        expect(message.is_retriable).toBe(true)
        expect(message.last_sending_error?.error).toBe(
            'Review already has a comment',
        )
    })

    it('renders failed action details inside a disclosure', async () => {
        const message = mockTicketMessage({
            actions: [
                {
                    name: 'http',
                    response: {
                        msg: '[SHOPIFY] Action failed',
                        response: 'Bad Request',
                        status_code: 400,
                    },
                    status: 'error',
                    title: 'HTTP hook',
                    type: 'http',
                },
            ],
            failed_datetime: null,
        })
        const { user } = render(
            <MessageErrors message={message} ticketId={123} />,
        )

        const [disclosureButton] = screen.getAllByRole('button', {
            name: /Find out why\?/,
        })
        expect(disclosureButton).toBeInTheDocument()

        await user.click(disclosureButton)

        expect(screen.getByText(/HTTP hook/)).toBeInTheDocument()
        expect(screen.getByText(/Action failed/)).toBeInTheDocument()
    })

    it('retries persisted messages through ticket-thread query hooks', async () => {
        const updateTicketMessageMock = mockUpdateTicketMessageHandler(
            async () => HttpResponse.json(mockUpdateTicketMessageResponse()),
        )
        const waitForUpdateTicketMessageRequest =
            updateTicketMessageMock.waitForRequest(server)
        server.use(updateTicketMessageMock.handler)
        const message = mockTicketMessage({
            actions: [
                {
                    name: 'http',
                    response: {
                        msg: 'Action failed',
                        response: 'Bad Request',
                        status_code: 400,
                    },
                    status: 'error',
                    title: 'HTTP hook',
                    type: 'http',
                },
            ],
            failed_datetime: null,
            id: 456,
            ticket_id: 123,
        })
        const { user } = render(
            <MessageErrors message={message} ticketId={123} />,
        )

        await user.click(screen.getByRole('button', { name: 'Retry' }))

        await waitForUpdateTicketMessageRequest(async (request) => {
            const url = new URL(request.url)
            expect(url.pathname).toContain('/api/tickets/123/messages/456')
            expect(url.searchParams.get('action')).toBe('retry')
            expect(await request.json()).toEqual({})
        })
    })

    it('forces persisted messages through ticket-thread query hooks', async () => {
        const updateTicketMessageMock = mockUpdateTicketMessageHandler(
            async () => HttpResponse.json(mockUpdateTicketMessageResponse()),
        )
        const waitForUpdateTicketMessageRequest =
            updateTicketMessageMock.waitForRequest(server)
        server.use(updateTicketMessageMock.handler)
        const message = mockTicketMessage({
            actions: [
                {
                    name: 'http',
                    response: {
                        msg: 'Action failed',
                        response: 'Bad Request',
                        status_code: 400,
                    },
                    status: 'error',
                    title: 'HTTP hook',
                    type: 'http',
                },
            ],
            failed_datetime: null,
            id: 456,
            ticket_id: 123,
        })
        const { user } = render(
            <MessageErrors message={message} ticketId={123} />,
        )

        await user.click(screen.getByRole('button', { name: 'Send Anyway' }))

        await waitForUpdateTicketMessageRequest(async (request) => {
            const url = new URL(request.url)
            expect(url.pathname).toContain('/api/tickets/123/messages/456')
            expect(url.searchParams.get('action')).toBe('force')
            expect(await request.json()).toEqual({})
        })
    })

    it('cancels pending messages through the legacy bridge', async () => {
        const legacyActions = makeLegacyActions()
        const message = {
            ...mockTicketMessage({
                failed_datetime: '2024-03-21T11:00:00Z',
                id: undefined,
            }),
            _internal: {
                status: 'open',
            },
        }
        const { user } = render(
            <MessageErrors message={message as any} ticketId={123} />,
            { legacyActions },
        )

        await user.click(screen.getByRole('button', { name: 'Cancel Message' }))

        expect(legacyActions.deleteTicketPendingMessage).toHaveBeenCalledWith(
            message,
        )
    })

    it('deletes persisted messages through ticket-thread query hooks', async () => {
        const deleteTicketMessageMock = mockDeleteTicketMessageHandler(
            async () => new HttpResponse(null),
        )
        const waitForDeleteTicketMessageRequest =
            deleteTicketMessageMock.waitForRequest(server)
        server.use(deleteTicketMessageMock.handler)
        const message = mockTicketMessage({
            failed_datetime: '2024-03-21T11:00:00Z',
            id: 456,
            is_retriable: true,
            ticket_id: 123,
        })
        const { user } = render(
            <MessageErrors message={message} ticketId={123} />,
        )

        await user.click(screen.getByRole('button', { name: 'Cancel Message' }))

        await waitForDeleteTicketMessageRequest((request) => {
            expect(new URL(request.url).pathname).toContain(
                '/api/tickets/123/messages/456',
            )
        })
    })

    it('notifies when retrying a persisted message fails', async () => {
        server.use(
            mockUpdateTicketMessageHandler(async () =>
                HttpResponse.json({ error: { msg: 'request failed' } } as any, {
                    status: 500,
                }),
            ).handler,
        )
        const message = mockTicketMessage({
            failed_datetime: '2024-03-21T11:00:00Z',
            id: 456,
            is_retriable: true,
            ticket_id: 123,
        })
        const { user } = render(
            <MessageErrors message={message} ticketId={123} />,
        )

        await user.click(screen.getByRole('button', { name: 'Retry' }))

        const toast = await screen.findByRole('status')
        expect(
            within(toast).getByText(
                'Message was not sent. Please try again in a few moments. If the problem persists, contact us.',
            ),
        ).toBeInTheDocument()
    })

    it('notifies when deleting a persisted message fails', async () => {
        server.use(
            mockDeleteTicketMessageHandler(async () =>
                HttpResponse.json({ error: { msg: 'request failed' } } as any, {
                    status: 500,
                }),
            ).handler,
        )
        const message = mockTicketMessage({
            failed_datetime: '2024-03-21T11:00:00Z',
            id: 456,
            ticket_id: 123,
        })
        const { user } = render(
            <MessageErrors message={message} ticketId={123} />,
        )

        await user.click(screen.getByRole('button', { name: 'Cancel Message' }))

        const toast = await screen.findByRole('status')
        expect(
            within(toast).getByText(
                'Failed to delete message 456 from ticket 123',
            ),
        ).toBeInTheDocument()
    })

    it('splits long failed message text between title and content', () => {
        const message = mockTicketMessage({
            failed_datetime: '2024-03-21T11:00:00Z',
            last_sending_error: {
                error: 'Message not sent: Shopify refund failed because the amount exceeds the order total.',
            },
        })

        render(<MessageErrors message={message} ticketId={123} />)

        expect(screen.getByText('Message not sent')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Shopify refund failed because the amount exceeds the order total.',
            ),
        ).toBeInTheDocument()
    })
})
