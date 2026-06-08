import type { ReactElement } from 'react'

import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import type { OrderActionHandlers } from '../OrderActionsContext'
import { OrderActionsContext } from '../OrderActionsContext'
import { OrderQuickActions } from '../OrderQuickActions'
import { makeOrder } from './fixtures'

function renderWithHandlers(
    ui: ReactElement,
    handlers: Partial<OrderActionHandlers> = {},
) {
    const value: OrderActionHandlers = {
        onEdit: vi.fn(),
        onDuplicate: vi.fn(),
        onRefund: vi.fn(),
        onCancel: vi.fn(),
        ...handlers,
    }
    return {
        value,
        ...render(
            <OrderActionsContext.Provider value={value}>
                {ui}
            </OrderActionsContext.Provider>,
        ),
    }
}

describe('OrderQuickActions', () => {
    it('renders all four actions for a regular order', () => {
        const order = makeOrder({ created_at: new Date().toISOString() }).data

        renderWithHandlers(
            <OrderQuickActions
                order={order}
                integrationId={1}
                isDraft={false}
            />,
        )

        expect(
            screen.getByRole('button', { name: /edit/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /duplicate/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /refund/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /cancel/i }),
        ).toBeInTheDocument()
    })

    it('renders nothing for a draft order', () => {
        const order = makeOrder().data

        const { container } = renderWithHandlers(
            <OrderQuickActions order={order} integrationId={1} isDraft />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('calls the edit handler with the integration id and order', async () => {
        const onEdit = vi.fn()
        const order = makeOrder({ created_at: new Date().toISOString() }).data

        const { user } = renderWithHandlers(
            <OrderQuickActions
                order={order}
                integrationId={7}
                isDraft={false}
            />,
            { onEdit },
        )

        await user.click(screen.getByRole('button', { name: /edit/i }))
        expect(onEdit).toHaveBeenCalledWith(7, order)
    })

    it('disables Refund for a refunded order', () => {
        const order = makeOrder({
            created_at: new Date().toISOString(),
            financial_status: 'refunded',
        }).data

        renderWithHandlers(
            <OrderQuickActions
                order={order}
                integrationId={1}
                isDraft={false}
            />,
        )

        expect(screen.getByRole('button', { name: /refund/i })).toBeDisabled()
    })

    it('disables Cancel for a cancelled order', () => {
        const order = makeOrder({
            created_at: new Date().toISOString(),
            cancelled_at: '2024-03-01T00:00:00Z',
        }).data

        renderWithHandlers(
            <OrderQuickActions
                order={order}
                integrationId={1}
                isDraft={false}
            />,
        )

        expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })
})
