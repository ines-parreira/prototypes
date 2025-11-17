import { render, screen } from '@testing-library/react'

import type { ShoppingAssistantEvent } from '../../../hooks/useInsertShoppingAssistantEventElements'
import { InfluencedOrderSource } from '../../../hooks/useInsertShoppingAssistantEventElements'
import { InfluencedOrderEvent } from '../InfluencedOrderEvent'

describe('InfluencedOrderEvent', () => {
    const generateMockEvent = (
        influencedBy: InfluencedOrderSource = InfluencedOrderSource.SHOPPING_ASSISTANT,
    ): ShoppingAssistantEvent => ({
        isShoppingAssistantEvent: true,
        type: 'influenced-order',
        created_datetime: '2024-03-20T10:00:00Z',
        data: {
            orderId: 123456789,
            orderNumber: 1001,
            shopName: 'test-shop',
            createdDatetime: '2024-03-20T10:00:00Z',
            influencedBy,
        },
    })

    it('renders the order link with correct URL and number', () => {
        render(
            <InfluencedOrderEvent event={generateMockEvent()} isLast={false} />,
        )

        const orderLink = screen.getByRole('link', { name: /Order #1001/i })
        expect(orderLink).toBeInTheDocument()
        expect(orderLink).toHaveAttribute(
            'href',
            'https://admin.shopify.com/store/test-shop/orders/123456789',
        )
    })

    it.each([
        { influencedBy: InfluencedOrderSource.AI_JOURNEY, label: 'AI Journey' },
        {
            influencedBy: InfluencedOrderSource.AI_AGENT,
            label: 'Shopping Assistant',
        },
        {
            influencedBy: InfluencedOrderSource.SHOPPING_ASSISTANT,
            label: 'Shopping Assistant',
        },
    ])(
        'renders text when influencedBy $influencedBy',
        ({ influencedBy, label }) => {
            render(
                <InfluencedOrderEvent
                    event={generateMockEvent(influencedBy)}
                    isLast={false}
                />,
            )

            expect(screen.getByText(/influenced/i)).toBeInTheDocument()
            expect(screen.getByText(/via/i)).toBeInTheDocument()
            expect(screen.getByText(RegExp(label, 'i'))).toBeInTheDocument()
        },
    )

    it('applies last class when isLast prop is true', () => {
        const { container } = render(
            <InfluencedOrderEvent event={generateMockEvent()} isLast={true} />,
        )

        expect(container.firstChild).toHaveClass('last')
    })

    it('does not apply last class when isLast prop is false', () => {
        const { container } = render(
            <InfluencedOrderEvent event={generateMockEvent()} isLast={false} />,
        )

        expect(container.firstChild).not.toHaveClass('last')
    })
})
