import { screen } from '@testing-library/react'

import { render } from '../../../../tests/render.utils'
import { OrderLineItemsSection } from './OrderLineItemsSection'

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

    it('renders the quantity', () => {
        render(<OrderLineItemsSection {...defaultProps} />)

        expect(screen.getByText('Qty: 2')).toBeInTheDocument()
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

describe('OrderLineItemsSection — totals', () => {
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
