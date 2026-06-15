import { render, screen } from '@testing-library/react'

import { TicketThreadPendingState } from '../../types'
import { MessageBubble } from './MessageBubble'

describe('MessageBubble', () => {
    it('adds the pending state as a data attribute when provided', () => {
        render(
            <MessageBubble pendingState={TicketThreadPendingState.Active}>
                Content
            </MessageBubble>,
        )

        expect(
            screen.getByText('Content').closest('[data-pending-state]'),
        ).toHaveAttribute('data-pending-state', TicketThreadPendingState.Active)
    })

    it('omits the pending state data attribute when not provided', () => {
        render(<MessageBubble>Content</MessageBubble>)

        expect(
            screen.getByText('Content').closest('[data-pending-state]'),
        ).toBeNull()
    })
})
