import { screen } from '@testing-library/react'

import { render } from '../../../tests/render.utils'
import { TicketThreadItemTag } from '../../../thread/itemTags'
import { InfluencedOrderSource } from '../../constants'
import { TicketThreadInfluencedOrderItem } from './TicketThreadInfluencedOrderItem'

vi.mock(
    '../../../events/components/TicketThreadEventItem/components/TicketThreadEventDateTime',
    () => ({
        TicketThreadEventDateTime: ({ datetime }: { datetime: string }) => (
            <span>{`Datetime ${datetime}`}</span>
        ),
    }),
)

function renderItem({
    influencedBy,
    datetime = '2024-03-20T10:00:00Z',
}: {
    influencedBy: InfluencedOrderSource
    datetime?: string
}) {
    return render(
        <TicketThreadInfluencedOrderItem
            item={{
                _tag: TicketThreadItemTag.ShoppingAssistant.InfluencedOrder,
                data: {
                    orderId: 123456789,
                    orderNumber: 1001,
                    shopName: 'test-shop',
                    created_datetime: '2024-03-20T10:00:00Z',
                    influencedBy,
                },
                datetime,
            }}
        />,
    )
}

function hasExactText(text: string) {
    return (_content: string, node: Element | null) =>
        node?.textContent === text
}

describe('TicketThreadInfluencedOrderItem', () => {
    it('renders the order link with the Shopify admin URL', () => {
        renderItem({
            influencedBy: InfluencedOrderSource.SHOPPING_ASSISTANT,
        })

        const orderLink = screen.getByRole('link', { name: /order #1001/i })

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
        'renders the legacy copy for $influencedBy',
        ({ influencedBy, label }) => {
            renderItem({ influencedBy })

            expect(screen.getByText('influenced')).toBeInTheDocument()
            expect(
                screen.getByText(hasExactText(`via ${label}`)),
            ).toBeInTheDocument()
        },
    )

    it('renders the standard event datetime from the influenced order', () => {
        renderItem({
            influencedBy: InfluencedOrderSource.SHOPPING_ASSISTANT,
            datetime: '2024-03-20T12:00:00Z',
        })

        expect(
            screen.getByText('Datetime 2024-03-20T10:00:00Z'),
        ).toBeInTheDocument()
    })
})
