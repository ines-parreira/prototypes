import { screen } from '@testing-library/react'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'

import type { LegacyBridgeActions } from '#legacy-bridge'
import { render } from '#tests/render.utils'
import { PendingMessageBanner } from '#ticket-messages/components/MessageBubble/components/PendingMessageBanner'

function makeLegacyActions(): LegacyBridgeActions {
    return {
        deleteTicketPendingMessage: vi.fn(),
        retrySubmitTicketMessage: vi.fn(),
        undoTicketPendingMessage: vi.fn(),
    }
}

describe('PendingMessageBanner', () => {
    it('renders the pending banner with an undo action when the pending message is still undoable', async () => {
        const legacyActions = makeLegacyActions()
        const message = {
            ...mockTicketMessage({
                failed_datetime: null,
                from_agent: true,
                source: {
                    type: 'email',
                },
                ticket_id: 123,
            }),
            _internal: {
                optimisticState: 'pending',
            },
        }
        const { user } = render(<PendingMessageBanner message={message} />, {
            legacyActions,
            legacyState: {
                newMessage: {
                    isSubmittingMessage: false,
                    canUndoTicketPendingMessage: () => true,
                },
            },
        })

        expect(screen.getByText('Message sending...')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Undo' }))

        expect(legacyActions.undoTicketPendingMessage).toHaveBeenCalledWith(
            message,
        )
    })

    it('renders the pending banner without an undo action once the undo window is gone', () => {
        const message = {
            ...mockTicketMessage({
                failed_datetime: null,
                from_agent: true,
                source: {
                    type: 'email',
                },
                ticket_id: 123,
            }),
            _internal: {
                optimisticState: 'pending',
            },
        }

        render(<PendingMessageBanner message={message} />)

        expect(screen.getByText('Message sending...')).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: 'Undo' }),
        ).not.toBeInTheDocument()
    })
})
