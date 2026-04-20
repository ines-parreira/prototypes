import { screen } from '@testing-library/react'

import type * as AxiomModule from '@gorgias/axiom'
import { toast } from '@gorgias/axiom'
import { mockTicketMessage } from '@gorgias/helpdesk-mocks'
import {
    useDeleteTicketMessage,
    useUpdateTicketMessage,
} from '@gorgias/helpdesk-queries'

import { render } from '../../../../tests/render.utils'
import type { LegacyBridgeActions } from '../../../../utils/LegacyBridge'
import { MessageErrors } from '../MessageErrors'

vi.mock('@gorgias/axiom', async () => {
    const actual = await vi.importActual<typeof AxiomModule>('@gorgias/axiom')

    return {
        ...actual,
        toast: {
            ...actual.toast,
            error: vi.fn(),
        },
    }
})

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual('@gorgias/helpdesk-queries')

    return {
        ...actual,
        useDeleteTicketMessage: vi.fn(),
        useUpdateTicketMessage: vi.fn(),
    }
})

function makeLegacyActions(): LegacyBridgeActions {
    return {
        deleteTicketPendingMessage: vi.fn(),
        retrySubmitTicketMessage: vi.fn(),
        undoTicketPendingMessage: vi.fn(),
    }
}

const mutateAsyncDeleteTicketMessage = vi.fn()
const mutateAsyncUpdateTicketMessage = vi.fn()
const mockToastError = vi.mocked(toast.error)
const mockUseDeleteTicketMessage = vi.mocked(useDeleteTicketMessage)
const mockUseUpdateTicketMessage = vi.mocked(useUpdateTicketMessage)

describe('MessageErrors', () => {
    beforeEach(() => {
        mutateAsyncDeleteTicketMessage.mockReset()
        mutateAsyncUpdateTicketMessage.mockReset()
        mockToastError.mockReset()

        mockUseDeleteTicketMessage.mockReturnValue({
            mutateAsync: mutateAsyncDeleteTicketMessage,
        } as unknown as ReturnType<typeof useDeleteTicketMessage>)
        mockUseUpdateTicketMessage.mockReturnValue({
            mutateAsync: mutateAsyncUpdateTicketMessage,
        } as unknown as ReturnType<typeof useUpdateTicketMessage>)
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

        expect(mutateAsyncUpdateTicketMessage).toHaveBeenCalledWith({
            ticketId: 123,
            id: 456,
            data: {},
            params: { action: 'retry' },
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

        expect(mutateAsyncDeleteTicketMessage).toHaveBeenCalledWith({
            ticketId: 123,
            id: 456,
        })
    })

    it('notifies when retrying a persisted message fails', async () => {
        mutateAsyncUpdateTicketMessage.mockRejectedValueOnce(
            new Error('request failed'),
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

        expect(mockToastError).toHaveBeenCalledWith(
            'Message was not sent. Please try again in a few moments. If the problem persists, contact us.',
        )
    })

    it('notifies when deleting a persisted message fails', async () => {
        mutateAsyncDeleteTicketMessage.mockRejectedValueOnce(
            new Error('request failed'),
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

        expect(mockToastError).toHaveBeenCalledWith(
            'Failed to delete message 456 from ticket 123',
        )
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
