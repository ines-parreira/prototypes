import { render, screen } from '@testing-library/react'

import type { Order } from 'constants/integrations/types/shopify'
import { FinancialStatus } from 'constants/integrations/types/shopify'
import { shopifyOrderFixture } from 'fixtures/shopify'

import OrderCard from '../OrderCard'

type OrderWithName = Order & { name: string; financial_status: FinancialStatus }

const mockOrder: OrderWithName = {
    ...shopifyOrderFixture(),
    name: '#454374533',
    financial_status: FinancialStatus.Paid,
    total_price: '299.99',
}

const defaultProps = {
    order: mockOrder,
    displayedDate: <span>Jan 1, 2025</span>,
}

describe('OrderCard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the order name', () => {
        render(<OrderCard {...defaultProps} />)

        expect(screen.getByText(`Order: ${mockOrder.name}`)).toBeInTheDocument()
    })

    it('should render order total price', () => {
        render(<OrderCard {...defaultProps} />)

        expect(screen.getByText('$299.99')).toBeInTheDocument()
    })

    it.each([
        ['EUR', '€'],
        ['GBP', '£'],
        ['CAD', '$'],
        ['AUD', '$'],
    ])(`should render correct money symbol for %s`, (currency, symbol) => {
        const props = { ...defaultProps, order: { ...mockOrder, currency } }
        render(<OrderCard {...props} />)
        expect(screen.getByText(`${symbol}299.99`)).toBeInTheDocument()
    })

    it('should render order items count', () => {
        render(<OrderCard {...defaultProps} />)

        expect(
            screen.getByText(`${mockOrder.line_items.length} items`),
        ).toBeInTheDocument()
    })

    it('should apply custom className when provided', () => {
        const { container } = render(
            <OrderCard {...defaultProps} className="custom-class" />,
        )

        expect(container.firstChild).toHaveClass('custom-class')
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

        render(<OrderCard {...defaultProps} order={orderWithSingleItem} />)

        expect(screen.getByText('1 items')).toBeInTheDocument()
    })

    it('should render order with no items', () => {
        const orderWithNoItems: OrderWithName = {
            ...mockOrder,
            line_items: [],
        }

        render(<OrderCard {...defaultProps} order={orderWithNoItems} />)

        expect(screen.getByText('0 items')).toBeInTheDocument()
    })
})
