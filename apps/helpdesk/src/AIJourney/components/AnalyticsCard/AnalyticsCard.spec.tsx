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
    created_datetime: '2025-07-30T12:00:00Z',
}

const mockJourneyConfigurations = {
    max_follow_up_messages: null,
    sms_sender_number: '+18668918539',
    sms_sender_integration_id: 131157,
    offer_discount: true,
    max_discount_percent: 22,
}

describe('<AnalyticsCard />', () => {
    beforeEach(() => {
        mockUseParams.mockReturnValue({ shopName: 'test-shop' })
    })

    it.skip('renders active status with correct badge and icon', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsCard
                        analyticsData={data}
                        abandonedCartJourney={mockAbandonedCartJourney}
                        journeyConfigurations={{
                            ...mockJourneyConfigurations,
                            offer_discount: false,
                            max_discount_percent: 0,
                        }}
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

    it.skip('renders paused status with correct badge and icon', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsCard
                        analyticsData={data}
                        abandonedCartJourney={{
                            ...mockAbandonedCartJourney,
                            state: JourneyStatusEnum.Paused,
                        }}
                        journeyConfigurations={{
                            ...mockJourneyConfigurations,
                            offer_discount: false,
                            max_discount_percent: 0,
                        }}
                    />
                </Provider>
            </QueryClientProvider>,
        )
        expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
        expect(screen.getByTestId('discount-card')).toBeInTheDocument()
    })

    it('should not render discount card when discount is already enabled', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsCard
                        analyticsData={data}
                        abandonedCartJourney={{
                            ...mockAbandonedCartJourney,
                            state: JourneyStatusEnum.Paused,
                        }}
                        journeyConfigurations={mockJourneyConfigurations}
                    />
                </Provider>
            </QueryClientProvider>,
        )
        expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
        expect(screen.queryByTestId('discount-card')).not.toBeInTheDocument()
    })
})
