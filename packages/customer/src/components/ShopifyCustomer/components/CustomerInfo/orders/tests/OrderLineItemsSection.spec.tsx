import { screen } from '@testing-library/react'

import { render } from '../../../../../../tests/render.utils'
import { OrderLineItemsSection } from '../sections/OrderLineItemsSection'

const mockLineItem = {
    id: 1,
    title: 'Fixie Bike',
    quantity: 2,
    price: '199.99',
    sku: 'fixie-bike',
    product_id: 101,
    variant_id: 201,
}

const mockLineItemWithoutSku = {
    id: 2,
    title: 'Road Bike',
    quantity: 1,
    price: '349.00',
    product_id: null,
    variant_id: null,
}

const defaultProps = {
    lineItems: [mockLineItem],
    moneySymbol: '$',
}

describe('OrderLineItemsSection', () => {
    it('renders nothing when there are no line items', () => {
        const { container } = render(
            <OrderLineItemsSection {...defaultProps} lineItems={[]} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('renders the "Line items" heading', () => {
        render(<OrderLineItemsSection {...defaultProps} />)

        expect(screen.getByText('Line items')).toBeInTheDocument()
    })

    it('renders the line item count in a tag', () => {
        render(
            <OrderLineItemsSection
                {...defaultProps}
                lineItems={[mockLineItem, mockLineItemWithoutSku]}
            />,
        )

        expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('renders the line item image with the title as alt text', () => {
        render(<OrderLineItemsSection {...defaultProps} />)

        expect(
            screen.getByRole('img', { name: 'Fixie Bike' }),
        ).toBeInTheDocument()
    })

    it('renders the line item title', () => {
        render(<OrderLineItemsSection {...defaultProps} />)

        expect(screen.getByText('Fixie Bike')).toBeInTheDocument()
    })

    it('renders SKU when present', () => {
        render(<OrderLineItemsSection {...defaultProps} />)

        expect(screen.getByText('SKU: fixie-bike')).toBeInTheDocument()
    })

    it('does not render SKU when absent', () => {
        render(
            <OrderLineItemsSection
                {...defaultProps}
                lineItems={[mockLineItemWithoutSku]}
            />,
        )

        expect(screen.queryByText(/SKU:/)).not.toBeInTheDocument()
    })

    it('renders the quantity in Nx format', () => {
        render(<OrderLineItemsSection {...defaultProps} />)

        expect(screen.getByText('2x')).toBeInTheDocument()
    })

    it('renders the price with money symbol', () => {
        render(<OrderLineItemsSection {...defaultProps} />)

        expect(screen.getByText('$199.99')).toBeInTheDocument()
    })

    it('renders all line items when multiple are provided', () => {
        render(
            <OrderLineItemsSection
                {...defaultProps}
                lineItems={[mockLineItem, mockLineItemWithoutSku]}
            />,
        )

        expect(screen.getByText('Fixie Bike')).toBeInTheDocument()
        expect(screen.getByText('Road Bike')).toBeInTheDocument()
    })
})

describe('OrderLineItemsSection — default totals', () => {
    it('renders subtotal when provided', () => {
        render(
            <OrderLineItemsSection {...defaultProps} subtotalPrice="399.98" />,
        )

        expect(screen.getByText('Subtotal')).toBeInTheDocument()
        expect(screen.getByText('$399.98')).toBeInTheDocument()
    })

    it('renders shipping when provided', () => {
        render(
            <OrderLineItemsSection
                {...defaultProps}
                totalShippingPrice="9.99"
            />,
        )

        expect(screen.getByText('Shipping')).toBeInTheDocument()
        expect(screen.getByText('$9.99')).toBeInTheDocument()
    })

    it('renders discount as negative when provided', () => {
        render(
            <OrderLineItemsSection {...defaultProps} totalDiscounts="37.13" />,
        )

        expect(screen.getByText('Discount')).toBeInTheDocument()
        expect(screen.getByText('- $37.13')).toBeInTheDocument()
    })

    it('does not render discount when zero', () => {
        render(
            <OrderLineItemsSection {...defaultProps} totalDiscounts="0.00" />,
        )

        expect(screen.queryByText('Discount')).not.toBeInTheDocument()
    })

    it('renders tax when provided', () => {
        render(<OrderLineItemsSection {...defaultProps} totalTax="32.00" />)

        expect(screen.getByText('Tax')).toBeInTheDocument()
        expect(screen.getByText('$32.00')).toBeInTheDocument()
    })

    it('renders total when provided', () => {
        render(<OrderLineItemsSection {...defaultProps} totalPrice="441.97" />)

        expect(screen.getByText('Total')).toBeInTheDocument()
        expect(screen.getByText('$441.97')).toBeInTheDocument()
    })

    it('does not render subtotal when absent', () => {
        render(<OrderLineItemsSection {...defaultProps} />)

        expect(screen.queryByText('Subtotal')).not.toBeInTheDocument()
    })

    it('does not render total when absent', () => {
        render(<OrderLineItemsSection {...defaultProps} />)

        expect(screen.queryByText('Total')).not.toBeInTheDocument()
    })
})

describe('OrderLineItemsSection — grouped line items', () => {
    const itemA = {
        id: 1,
        title: 'TIRO19 (M)',
        quantity: 1,
        price: '25.00',
        sku: '12345567',
        product_id: 101,
        variant_id: 201,
    }

    const itemB = {
        id: 2,
        title: '49ers Campus Hoodie - Black',
        quantity: 1,
        price: '14.99',
        sku: '55671234',
        product_id: 102,
        variant_id: 202,
    }

    const itemC = {
        id: 3,
        title: 'TIRO19 (M) Extra',
        quantity: 1,
        price: '25.00',
        sku: '12345567',
        product_id: 101,
        variant_id: 203,
    }

    it('renders "Removed" group for refunded items', () => {
        const refunds = [
            {
                id: 1,
                order_id: 1,
                note: 'Refund was performed by Stefan Mitro',
                created_at: '2026-01-01T00:00:00Z',
                processed_at: '2026-01-01T00:00:00Z',
                refund_line_items: [
                    {
                        id: 10,
                        quantity: 1,
                        line_item_id: 1,
                        restock_type: 'cancel' as const,
                        subtotal: 25,
                        total_tax: 0,
                    },
                ],
                transactions: [
                    {
                        id: 100,
                        amount: '25.00',
                        kind: 'refund',
                        status: 'success',
                    },
                ],
            },
        ]

        render(
            <OrderLineItemsSection
                lineItems={[itemA, itemB]}
                moneySymbol="$"
                refunds={refunds}
                returns={[]}
                totalPrice="39.99"
                subtotalPrice="39.99"
                totalTax="0.00"
            />,
        )

        expect(screen.getByText('Line items')).toBeInTheDocument()
        expect(screen.getByText('Removed')).toBeInTheDocument()
    })

    it('renders "Return in progress" group for open returns', () => {
        const returns = [
            {
                id: 1,
                closed_at: null,
                return_line_items: [{ line_item_id: 2, quantity: 1 }],
            },
        ]

        render(
            <OrderLineItemsSection
                lineItems={[itemA, itemB]}
                moneySymbol="$"
                refunds={[]}
                returns={returns}
            />,
        )

        expect(screen.getByText('Return in progress')).toBeInTheDocument()
    })

    it('renders "Return closed" group for closed returns', () => {
        const returns = [
            {
                id: 1,
                closed_at: '2026-01-15T00:00:00Z',
                return_line_items: [{ line_item_id: 1, quantity: 1 }],
            },
        ]

        render(
            <OrderLineItemsSection
                lineItems={[itemA, itemB]}
                moneySymbol="$"
                refunds={[]}
                returns={returns}
            />,
        )

        expect(screen.getByText('Return closed')).toBeInTheDocument()
    })

    it('does not render "Line items" when all items are removed', () => {
        const refunds = [
            {
                id: 1,
                order_id: 1,
                note: '',
                created_at: '2026-01-01T00:00:00Z',
                processed_at: '2026-01-01T00:00:00Z',
                refund_line_items: [
                    {
                        id: 10,
                        quantity: 1,
                        line_item_id: 1,
                        restock_type: 'cancel' as const,
                        subtotal: 25,
                        total_tax: 0,
                    },
                    {
                        id: 11,
                        quantity: 1,
                        line_item_id: 2,
                        restock_type: 'cancel' as const,
                        subtotal: 14.99,
                        total_tax: 0,
                    },
                    {
                        id: 12,
                        quantity: 1,
                        line_item_id: 3,
                        restock_type: 'no_restock' as const,
                        subtotal: 25,
                        total_tax: 0,
                    },
                ],
                transactions: [
                    {
                        id: 100,
                        amount: '64.99',
                        kind: 'refund',
                        status: 'success',
                    },
                ],
            },
        ]

        render(
            <OrderLineItemsSection
                lineItems={[itemA, itemB, itemC]}
                moneySymbol="$"
                refunds={refunds}
                returns={[]}
            />,
        )

        expect(screen.queryByText('Line items')).not.toBeInTheDocument()
        expect(screen.getByText('Removed')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
    })
})

describe('OrderLineItemsSection — refund pricing', () => {
    const item = {
        id: 1,
        title: 'TIRO19 (M)',
        quantity: 1,
        price: '25.00',
        sku: '12345567',
        product_id: 101,
        variant_id: 201,
    }

    const refunds = [
        {
            id: 1,
            order_id: 1,
            note: 'Refund was performed by Stefan Mitro',
            created_at: '2026-01-01T00:00:00Z',
            processed_at: '2026-01-01T00:00:00Z',
            refund_line_items: [
                {
                    id: 10,
                    quantity: 1,
                    line_item_id: 1,
                    restock_type: 'cancel' as const,
                    subtotal: 25,
                    total_tax: 0,
                },
            ],
            transactions: [
                {
                    id: 100,
                    amount: '25.00',
                    kind: 'refund',
                    status: 'success',
                },
            ],
        },
    ]

    it('renders refund payment labels when refunds exist', () => {
        render(
            <OrderLineItemsSection
                lineItems={[item]}
                moneySymbol="$"
                subtotalPrice="64.99"
                totalTax="4.60"
                totalPrice="69.59"
                currentTotalPrice="44.59"
                refunds={refunds}
                returns={[]}
            />,
        )

        expect(screen.getByText('Original order')).toBeInTheDocument()
        expect(screen.getByText('Paid')).toBeInTheDocument()
        expect(screen.getByText('Refunded')).toBeInTheDocument()
        expect(screen.getByText('Net payment')).toBeInTheDocument()
        expect(screen.queryByText('Total')).not.toBeInTheDocument()
        expect(screen.queryByText('Subtotal')).not.toBeInTheDocument()
    })

    it('renders the refund note', () => {
        render(
            <OrderLineItemsSection
                lineItems={[item]}
                moneySymbol="$"
                totalPrice="69.59"
                currentTotalPrice="44.59"
                refunds={refunds}
                returns={[]}
            />,
        )

        expect(
            screen.getByText(
                '\u201CRefund was performed by Stefan Mitro\u201D',
            ),
        ).toBeInTheDocument()
    })

    it('renders net payment using currentTotalPrice from Shopify', () => {
        render(
            <OrderLineItemsSection
                lineItems={[item]}
                moneySymbol="$"
                totalPrice="69.59"
                currentTotalPrice="44.59"
                refunds={refunds}
                returns={[]}
            />,
        )

        expect(screen.getByText('$44.59')).toBeInTheDocument()
    })

    it('renders net payment as $0.00 when both prices are missing', () => {
        render(
            <OrderLineItemsSection
                lineItems={[item]}
                moneySymbol="$"
                refunds={refunds}
                returns={[]}
            />,
        )

        expect(screen.getByText('Net payment')).toBeInTheDocument()
        expect(screen.getByText('$0.00')).toBeInTheDocument()
    })

    it('renders shipping in refund pricing when provided', () => {
        render(
            <OrderLineItemsSection
                lineItems={[item]}
                moneySymbol="$"
                subtotalPrice="64.99"
                totalShippingPrice="5.99"
                totalTax="4.60"
                totalPrice="75.58"
                currentTotalPrice="50.58"
                refunds={refunds}
                returns={[]}
            />,
        )

        expect(screen.getByText('Original order')).toBeInTheDocument()
        expect(screen.getByText('Shipping')).toBeInTheDocument()
        expect(screen.getByText('$5.99')).toBeInTheDocument()
    })

    it('renders default pricing when no refunds', () => {
        render(
            <OrderLineItemsSection
                lineItems={[item]}
                moneySymbol="$"
                subtotalPrice="64.99"
                totalTax="4.60"
                totalPrice="69.59"
            />,
        )

        expect(screen.getByText('Subtotal')).toBeInTheDocument()
        expect(screen.getByText('Total')).toBeInTheDocument()
        expect(screen.queryByText('Original order')).not.toBeInTheDocument()
        expect(screen.queryByText('Net payment')).not.toBeInTheDocument()
    })
})
