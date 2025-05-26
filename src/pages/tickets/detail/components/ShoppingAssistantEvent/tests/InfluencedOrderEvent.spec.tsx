import { render, screen } from '@testing-library/react'

import { ShoppingAssistantEvent } from '../../../hooks/useInsertShoppingAssistantEventElements'
import { InfluencedOrderEvent } from '../InfluencedOrderEvent'

describe('InfluencedOrderEvent', () => {
    const mockEvent: ShoppingAssistantEvent = {
        isShoppingAssistantEvent: true,
        type: 'influenced-order',
        created_datetime: '2024-03-20T10:00:00Z',
        data: {
            orderId: 123456789,
            orderNumber: 1001,
            shopName: 'test-shop',
            createdDatetime: '2024-03-20T10:00:00Z',
        },
    }

    it('renders the order link with correct URL and number', () => {
        render(<InfluencedOrderEvent event={mockEvent} isLast={false} />)

        const orderLink = screen.getByRole('link', { name: /Order #1001/i })
        expect(orderLink).toBeInTheDocument()
        expect(orderLink).toHaveAttribute(
            'href',
            'https://admin.shopify.com/store/test-shop/orders/123456789',
        )
    })

    it('renders text', () => {
        render(<InfluencedOrderEvent event={mockEvent} isLast={false} />)

        expect(screen.getByText(/influenced/i)).toBeInTheDocument()
        expect(screen.getByText(/via/i)).toBeInTheDocument()
        expect(screen.getByText(/Shopping Assistant/i)).toBeInTheDocument()
    })

    it('applies last class when isLast prop is true', () => {
        const { container } = render(
            <InfluencedOrderEvent event={mockEvent} isLast={true} />,
        )

        expect(container.firstChild).toHaveClass('last')
    })

    it('does not apply last class when isLast prop is false', () => {
        const { container } = render(
            <InfluencedOrderEvent event={mockEvent} isLast={false} />,
        )

        expect(container.firstChild).not.toHaveClass('last')
    })
})
