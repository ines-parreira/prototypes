import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { JourneyStatusEnum, JourneyTypeEnum } from '@gorgias/convert-client'

import { appQueryClient } from 'api/queryClient'
import { mockStore } from 'utils/testing'

import { AnalyticsCard } from './AnalyticsCard'

jest.mock('AIJourney/components/DiscountCard/DiscountCard', () => ({
    DiscountCard: () => <div data-testid="discount-card" />,
}))

const mockUseParams = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => mockUseParams(),
}))

const data = [
    { label: 'Revenue', value: '$999', variation: '+24%' },
    { label: 'Orders', value: '789', variation: '+9%' },
    { label: 'Conversion Rate', value: '9%', variation: '0%' },
]

const mockAbandonedCartJourney = {
    id: '01JZQS8ZYFFQPDB6NJTKNP7PYB',
    type: JourneyTypeEnum.CartAbandoned,
    account_id: 69822,
    store_integration_id: 127357,
    store_name: 'leobel-campaigns',
    store_type: 'shopify',
    state: JourneyStatusEnum.Active,
}

describe('<AnalyticsCard />', () => {
    beforeEach(() => {
        mockUseParams.mockReturnValue({ shopName: 'test-shop' })
    })

    it('renders active status with correct badge and icon', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsCard
                        analyticsData={data}
                        abandonedCartJourney={mockAbandonedCartJourney}
                    />
                </Provider>
            </QueryClientProvider>,
        )
        expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
        expect(screen.getByText('ACTIVE')).toBeInTheDocument()
        expect(screen.getByTestId('discount-card')).toBeInTheDocument()
        const img = screen.getByAltText('sphere-icon')
        expect(img).toBeInTheDocument()
    })

    it('renders paused status with correct badge and icon', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsCard
                        analyticsData={data}
                        abandonedCartJourney={{
                            ...mockAbandonedCartJourney,
                            state: JourneyStatusEnum.Paused,
                        }}
                    />
                </Provider>
            </QueryClientProvider>,
        )
        expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
        expect(screen.getByTestId('discount-card')).toBeInTheDocument()
    })
})
