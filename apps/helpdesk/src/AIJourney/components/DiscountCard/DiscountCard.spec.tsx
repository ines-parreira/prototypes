import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import { DiscountCard, DiscountCardProps } from './DiscountCard'

const renderDiscountCard = (props: DiscountCardProps = {}) => {
    return renderWithRouter(<DiscountCard {...props} />, {
        path: '/app/ai-journey/:shopName/performance',
        route: '/app/ai-journey/test-store/performance',
    })
}

describe('<DiscountCard />', () => {
    it('renders description when no revenue', () => {
        renderDiscountCard()

        expect(
            screen.getByText(
                'Boost conversion by 50% by including a discount code',
            ),
        ).toBeInTheDocument()
    })

    it('renders description when revenue', () => {
        renderDiscountCard({
            totalRevenue: {
                label: 'Total Revenue',
                value: 150,
                prevValue: null,
                interpretAs: 'more-is-better',
                metricFormat: 'currency',
                currency: 'USD',
                isLoading: false,
            },
        })

        expect(
            screen.getByText((_content, element) => {
                return (
                    element?.textContent ===
                    'Boost conversion by 50% (+$75) by including a discount code here'
                )
            }),
        ).toBeInTheDocument()
    })

    it('has correct link to setup page', async () => {
        renderDiscountCard()

        const link = screen.getByRole('link', { name: 'here' })
        expect(link.getAttribute('href')).toBe(
            '/app/ai-journey/test-store/cart-abandoned/setup',
        )
    })

    it('renders max discount when discount is enabled', () => {
        renderDiscountCard({
            isDiscountEnabled: true,
            maxDiscount: 10,
        })

        expect(
            screen.getByText('Discount code included is 10%'),
        ).toBeInTheDocument()
    })
})
