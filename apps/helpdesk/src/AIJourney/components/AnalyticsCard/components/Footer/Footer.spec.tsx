import { render, screen } from '@testing-library/react'

import { JourneyTypeEnum } from '@gorgias/convert-client'

import type { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import { renderWithRouter } from 'utils/testing'

import { Footer } from './Footer'

const mockUseParams = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => mockUseParams(),
}))

describe('Footer', () => {
    beforeEach(() => {
        mockUseParams.mockReturnValue({ shopName: 'test-shop' })
    })

    it('should render discount information when discount is enabled', () => {
        render(
            <Footer
                journeyType={JourneyTypeEnum.CartAbandoned}
                maxDiscount={20}
                isDiscountEnabled={true}
            />,
        )

        expect(
            screen.getByText('Discount code included is 20%'),
        ).toBeInTheDocument()
    })

    it('should render discount suggestion when discount is disabled', () => {
        const mockTotalRevenue = {
            label: 'Total Revenue',
            value: 0,
            prevValue: null,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'currency',
            currency: 'USD',
            isLoading: false,
        } as MetricProps

        renderWithRouter(
            <Footer
                journeyType={JourneyTypeEnum.CartAbandoned}
                isDiscountEnabled={false}
                maxDiscount={99}
                totalRevenue={mockTotalRevenue}
            />,
        )

        expect(
            screen.getByText(
                'Boost conversion by 50% by including a discount code',
            ),
        ).toBeInTheDocument()
    })
})
