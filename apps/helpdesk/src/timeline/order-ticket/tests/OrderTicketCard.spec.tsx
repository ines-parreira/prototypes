import { render, screen } from '@testing-library/react'

import { FinancialStatus, Order } from 'constants/integrations/types/shopify'
import { shopifyOrderFixture } from 'fixtures/shopify'

import OrderTicketCard from '../OrderTicketCard'

type OrderWithName = Order & { name: string; financial_status: FinancialStatus }

const mockOrder: OrderWithName = {
    ...shopifyOrderFixture(),
    name: 'Order #454374533',
    financial_status: FinancialStatus.Paid,
    total_price: '299.99',
}

const defaultProps = {
    order: mockOrder,
    displayedDate: <span>Jan 1, 2025</span>,
}

describe('OrderTicketCard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the order id', () => {
        render(<OrderTicketCard {...defaultProps} />)

        expect(screen.getByText(mockOrder.id)).toBeInTheDocument()
    })

    it('should render order total price', () => {
        render(<OrderTicketCard {...defaultProps} />)

        expect(screen.getByText('$299.99')).toBeInTheDocument()
    })

    it('should render order items count', () => {
        render(<OrderTicketCard {...defaultProps} />)

        expect(
            screen.getByText(`${mockOrder.line_items.length} items`),
        ).toBeInTheDocument()
    })

    it('should apply custom className when provided', () => {
        const { container } = render(
            <OrderTicketCard {...defaultProps} className="custom-class" />,
        )

        expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should highlight the card when isHighlighted is true', () => {
        const { container, rerender } = render(
            <OrderTicketCard {...defaultProps} isHighlighted={true} />,
        )

        expect(container.firstChild).toHaveClass('highlight')

        rerender(<OrderTicketCard {...defaultProps} isHighlighted={false} />)

        expect(container.firstChild).not.toHaveClass('highlight')
    })

    it('should render order with single item', () => {
        const orderWithSingleItem: OrderWithName = {
            ...mockOrder,
            line_items: [
                {
                    title: 'Single Product',
                    variant_id: 1,
                    variant_title: 'Single Product Variant',
                    quantity: 1,
                    price: '9.99',
                    sku: 'SKU123',
                    vendor: 'Test Vendor',
                    product_id: 1,
                    fulfillment_service: 'manual',
                    grams: 100,
                    taxable: true,
                    gift_card: false,
                    requires_shipping: true,
                    total_discount: '0.00',
                    fulfillable_quantity: 1,
                    tax_lines: [],
                    applied_discount: undefined,
                    name: 'Single Product',
                    properties: [],
                    custom: false,
                    admin_graphql_api_id: 'gid://shopify/LineItem/1',
                    product_exists: true,
                    total_discounts: '0.00',
                    discount_allocations: [],
                },
            ],
        }

        render(
            <OrderTicketCard {...defaultProps} order={orderWithSingleItem} />,
        )

        expect(screen.getByText('1 items')).toBeInTheDocument()
    })

    it('should render order with no items', () => {
        const orderWithNoItems: OrderWithName = {
            ...mockOrder,
            line_items: [],
        }

        render(<OrderTicketCard {...defaultProps} order={orderWithNoItems} />)

        expect(screen.getByText('0 items')).toBeInTheDocument()
    })
})
