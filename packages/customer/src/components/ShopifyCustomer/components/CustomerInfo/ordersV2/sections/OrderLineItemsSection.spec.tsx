import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import type { OrderRefund, OrderReturn } from '../../../../types'
import { OrderLineItemsSection } from './OrderLineItemsSection'

vi.mock('@gorgias/toolkit-react', async (importOriginal) => ({
    ...((await importOriginal()) as Record<string, unknown>),
    useCopyToClipboard: () => [
        {},
        (text: string) => navigator.clipboard.writeText(text),
    ],
}))

const activeItem = {
    id: 1,
    title: 'Fixie Bike',
    quantity: 2,
    price: '199.99',
    sku: 'fixie-bike',
    variant_title: 'Gold / S',
    product_id: 101,
    variant_id: 201,
}

const defaultProps = {
    lineItems: [activeItem],
    moneySymbol: '$',
}

function makeRefund(
    lineItemId: number,
    quantity: number,
    restockType: OrderRefund['refund_line_items'][number]['restock_type'],
): OrderRefund {
    return {
        id: 1,
        order_id: 100,
        created_at: '2024-01-01T00:00:00Z',
        note: null,
        processed_at: '2024-01-01T00:00:00Z',
        transactions: [],
        refund_line_items: [
            {
                id: 1,
                line_item_id: lineItemId,
                quantity,
                restock_type: restockType,
                subtotal: 0,
                total_tax: 0,
            },
        ],
    }
}

function makeReturn(
    lineItemId: number,
    quantity: number,
    closed = false,
): OrderReturn {
    return {
        id: 1,
        status: closed ? 'closed' : 'open',
        closed_at: closed ? '2024-01-01T00:00:00Z' : null,
        return_line_items: [{ line_item_id: lineItemId, quantity }],
    }
}

describe('OrderLineItemsSection (V2)', () => {
    it('renders nothing when line items array is empty', () => {
        const { container } = render(
            <OrderLineItemsSection {...defaultProps} lineItems={[]} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('renders the "Line items" group header', () => {
        render(<OrderLineItemsSection {...defaultProps} />)

        expect(screen.getByText('Line items')).toBeInTheDocument()
    })

    it('renders an active line item via LineItemRow', () => {
        render(<OrderLineItemsSection {...defaultProps} />)

        expect(screen.getByText('Gold / S')).toBeInTheDocument()
        expect(screen.getByText('2x')).toBeInTheDocument()
        expect(screen.getByText('$199.99')).toBeInTheDocument()
    })

    it('renders the "Removed" group header when an item is cancelled', () => {
        render(
            <OrderLineItemsSection
                {...defaultProps}
                refunds={[
                    makeRefund(activeItem.id, activeItem.quantity, 'cancel'),
                ]}
            />,
        )

        expect(screen.getByText('Removed')).toBeInTheDocument()
    })

    it('renders the "Return in progress" group header for open returns', () => {
        render(
            <OrderLineItemsSection
                {...defaultProps}
                returns={[makeReturn(activeItem.id, 1)]}
            />,
        )

        expect(screen.getByText('Return in progress')).toBeInTheDocument()
    })

    it('renders the default pricing section when there are no refunds', () => {
        render(
            <OrderLineItemsSection
                {...defaultProps}
                totalPrice="199.99"
                totalTax="16.67"
            />,
        )

        expect(screen.getByText('Total')).toBeInTheDocument()
    })

    it('renders the refund pricing section when refunds are present', () => {
        render(
            <OrderLineItemsSection
                {...defaultProps}
                refunds={[makeRefund(activeItem.id, 1, 'cancel')]}
                totalPrice="199.99"
                currentTotalPrice="100.00"
            />,
        )

        expect(screen.getByText('Net payment')).toBeInTheDocument()
    })

    it('renders multiple line items', () => {
        const secondItem = {
            id: 2,
            title: 'Road Bike',
            quantity: 1,
            price: '349.00',
            variant_title: null,
            product_id: null,
            variant_id: null,
        }

        render(
            <OrderLineItemsSection
                {...defaultProps}
                lineItems={[activeItem, secondItem]}
            />,
        )

        expect(screen.getByText('Gold / S')).toBeInTheDocument()
        expect(screen.getByText('Road Bike')).toBeInTheDocument()
    })
})
