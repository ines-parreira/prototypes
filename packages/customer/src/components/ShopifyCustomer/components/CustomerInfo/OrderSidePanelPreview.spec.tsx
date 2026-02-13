import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'

import { OrderSidePanelPreview } from './OrderSidePanelPreview'

const mockOrder = {
    name: '#3519',
    financial_status: 'paid' as const,
    fulfillment_status: 'fulfilled' as const,
}

const mockPendingOrder = {
    name: '#3520',
    financial_status: 'pending' as const,
    fulfillment_status: null,
}

describe('OrderSidePanelPreview', () => {
    it('should not render when order is null', () => {
        const { container } = render(
            <OrderSidePanelPreview
                order={null}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render order details when open', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText(/Order #3519/i)).toBeInTheDocument()
        })
    })

    it('should display vendor-shopify-colored icon', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            const icon = screen.getByRole('img', {
                name: 'vendor-shopify-colored',
            })
            expect(icon).toBeInTheDocument()
        })
    })

    it('should display financial status tag', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Paid')).toBeInTheDocument()
        })
    })

    it('should display fulfillment status tag', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Fulfilled')).toBeInTheDocument()
        })
    })

    it('should display pending status for pending orders', async () => {
        render(
            <OrderSidePanelPreview
                order={mockPendingOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Pending')).toBeInTheDocument()
        })
    })

    it('should display unfulfilled status for unfulfilled orders', async () => {
        render(
            <OrderSidePanelPreview
                order={mockPendingOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Unfulfilled')).toBeInTheDocument()
        })
    })

    it('should render action buttons', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
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
    })

    it('should call onOpenChange when close button is clicked', async () => {
        const user = userEvent.setup()
        const onOpenChange = vi.fn()

        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={onOpenChange}
            />,
        )

        const closeButton = await screen.findByRole('button', {
            name: /close preview/i,
        })
        await user.click(closeButton)

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('should call onDuplicate when duplicate button is clicked', async () => {
        const user = userEvent.setup()
        const onDuplicate = vi.fn()

        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
                onDuplicate={onDuplicate}
            />,
        )

        const duplicateButton = await screen.findByRole('button', {
            name: /duplicate/i,
        })
        await user.click(duplicateButton)

        expect(onDuplicate).toHaveBeenCalledWith(mockOrder)
    })

    it('should call onRefund when refund button is clicked', async () => {
        const user = userEvent.setup()
        const onRefund = vi.fn()

        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
                onRefund={onRefund}
            />,
        )

        const refundButton = await screen.findByRole('button', {
            name: /refund/i,
        })
        await user.click(refundButton)

        expect(onRefund).toHaveBeenCalledWith(mockOrder)
    })

    it('should call onCancel when cancel button is clicked', async () => {
        const user = userEvent.setup()
        const onCancel = vi.fn()

        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
                onCancel={onCancel}
            />,
        )

        const cancelButton = await screen.findByRole('button', {
            name: /cancel/i,
        })
        await user.click(cancelButton)

        expect(onCancel).toHaveBeenCalledWith(mockOrder)
    })
})
