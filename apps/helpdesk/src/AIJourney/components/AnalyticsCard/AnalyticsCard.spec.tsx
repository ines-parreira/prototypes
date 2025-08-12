import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { JourneyStatusEnum, JourneyTypeEnum } from '@gorgias/convert-client'

import { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import { appQueryClient } from 'api/queryClient'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
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

jest.mock('domains/reporting/state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone,
)

const period = {
    start: '1970-01-01T00:00:00+00:00',
    end: '1970-01-01T00:00:00+00:00',
}
const data = [
    {
        label: 'Revenue',
        value: 999,
        prevValue: 1000,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency: 'CAD',
        isLoading: false,
    },
    {
        label: 'Orders',
        value: 789,
        prevValue: 789,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency: 'CAD',
        isLoading: false,
    },
    {
        label: 'Conversion Rate',
        value: 9,
        prevValue: 7589,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency: 'CAD',
        isLoading: false,
    },
] as MetricProps[]

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

const cleanStatsFilters = {
    period: {
        start_datetime: '1970-01-01T00:00:00+00:00',
        end_datetime: '1970-01-01T00:00:00+00:00',
    },
}

describe('<AnalyticsCard />', () => {
    beforeEach(() => {
        mockUseParams.mockReturnValue({ shopName: 'test-shop' })

        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            userTimezone: 'someTimezone',
            cleanStatsFilters,
            granularity: ReportingGranularity.Day,
        })
    })

    it('renders active status with correct badge and icon', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsCard
                        period={period}
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

    it('renders paused status with correct badge and icon', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsCard
                        period={period}
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
                        period={period}
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
