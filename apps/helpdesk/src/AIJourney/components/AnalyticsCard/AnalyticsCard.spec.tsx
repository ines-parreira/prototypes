import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import {
    JourneyDetailApiDTO,
    JourneyStatusEnum,
    JourneyTypeEnum,
} from '@gorgias/convert-client'

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

const mockHandleUpdate = jest.fn()
jest.mock('AIJourney/hooks', () => ({
    useJourneyUpdateHandler: () => ({
        handleUpdate: mockHandleUpdate,
    }),
}))

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
    created_datetime: '2023-01-01T00:00:00Z',
}

const mockJourneyData = {
    id: '01JZAPAD606K1JSKNHC8KVA4BD',
    type: 'cart_abandoned',
    account_id: 6069,
    store_integration_id: 33858,
    store_name: 'artemisathletix',
    store_type: 'shopify',
    state: 'active',
    message_instructions: '',
    created_datetime: '2025-07-04T12:24:29.121874',
    meta: {
        ticket_view_id: 2099726,
    },
    configuration: {
        max_follow_up_messages: null,
        sms_sender_number: '+18668918539',
        sms_sender_integration_id: 131157,
        offer_discount: true,
        max_discount_percent: 22,
    },
}

const cleanStatsFilters = {
    period: {
        start_datetime: '1970-01-01T00:00:00+00:00',
        end_datetime: '1970-01-01T00:00:00+00:00',
    },
}

describe('<AnalyticsCard />', () => {
    beforeEach(() => {
        appQueryClient.clear()
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
                        journey={mockAbandonedCartJourney}
                        journeyData={
                            {
                                ...mockJourneyData,
                                configuration: {
                                    ...mockJourneyData.configuration,
                                    offer_discount: false,
                                    max_discount_percent: 0,
                                },
                            } as JourneyDetailApiDTO
                        }
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
                        journey={{
                            ...mockAbandonedCartJourney,
                            state: JourneyStatusEnum.Paused,
                        }}
                        journeyData={
                            {
                                ...mockJourneyData,
                                configuration: {
                                    ...mockJourneyData.configuration,
                                    offer_discount: false,
                                    max_discount_percent: 0,
                                },
                            } as JourneyDetailApiDTO
                        }
                    />
                </Provider>
            </QueryClientProvider>,
        )
        expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
        expect(screen.getByTestId('discount-card')).toBeInTheDocument()
    })

    it('should call handleUpdate with correct parameters when clicking pause button', async () => {
        mockHandleUpdate.mockClear()
        mockHandleUpdate.mockResolvedValue({
            data: { state: JourneyStatusEnum.Paused },
        })

        const user = userEvent.setup()
        render(
            <MemoryRouter>
                <QueryClientProvider client={appQueryClient}>
                    <Provider store={mockStore({})}>
                        <AnalyticsCard
                            period={period}
                            analyticsData={data}
                            journey={{
                                ...mockAbandonedCartJourney,
                                message_instructions:
                                    'Custom message instructions for pause test',
                            }}
                            journeyData={mockJourneyData as JourneyDetailApiDTO}
                            integrationId={12345}
                        />
                    </Provider>
                </QueryClientProvider>
            </MemoryRouter>,
        )

        const moreButton = screen.getByLabelText('Open options')
        await act(async () => {
            await user.click(moreButton)
        })

        await waitFor(() => {
            expect(screen.getByText('Pause Journey')).toBeInTheDocument()
        })

        const pauseButton = screen.getByText('Pause Journey')
        await act(async () => {
            await user.click(pauseButton)
        })

        await waitFor(() => {
            expect(mockHandleUpdate).toHaveBeenCalledWith({
                journeyState: JourneyStatusEnum.Paused,
                journeyMessageInstructions:
                    'Custom message instructions for pause test',
            })
        })
    })

    it('should call handleUpdate with correct parameters when clicking activate button', async () => {
        mockHandleUpdate.mockClear()
        mockHandleUpdate.mockResolvedValue({
            data: { state: JourneyStatusEnum.Active },
        })

        const user = userEvent.setup()
        render(
            <MemoryRouter>
                <QueryClientProvider client={appQueryClient}>
                    <Provider store={mockStore({})}>
                        <AnalyticsCard
                            period={period}
                            analyticsData={data}
                            journey={{
                                ...mockAbandonedCartJourney,
                                state: JourneyStatusEnum.Paused,
                                message_instructions:
                                    'Custom message instructions for activate test',
                            }}
                            journeyData={mockJourneyData as JourneyDetailApiDTO}
                            integrationId={12345}
                        />
                    </Provider>
                </QueryClientProvider>
            </MemoryRouter>,
        )

        const moreButton = screen.getByLabelText('Open options')
        await act(async () => {
            await user.click(moreButton)
        })

        await waitFor(() => {
            expect(screen.getByText('Activate Journey')).toBeInTheDocument()
        })

        const activateButton = screen.getByText('Activate Journey')
        await act(async () => {
            await user.click(activateButton)
        })

        await waitFor(() => {
            expect(mockHandleUpdate).toHaveBeenCalledWith({
                journeyState: JourneyStatusEnum.Active,
                journeyMessageInstructions:
                    'Custom message instructions for activate test',
            })
        })
    })

    it('renders loading state when isLoading is true for all metrics', () => {
        const loadingData = data.map((metric) => ({
            ...metric,
            isLoading: true,
        }))
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsCard
                        period={period}
                        analyticsData={loadingData}
                        journey={mockAbandonedCartJourney}
                        journeyData={
                            {
                                ...mockJourneyData,
                                configuration: {
                                    ...mockJourneyData.configuration,
                                    offer_discount: false,
                                    max_discount_percent: 0,
                                },
                            } as JourneyDetailApiDTO
                        }
                    />
                </Provider>
            </QueryClientProvider>,
        )

        // Assert that sent messages are not displayed
        expect(screen.queryByText('total recipient')).not.toBeInTheDocument()
        expect(screen.queryByText('total recipients')).not.toBeInTheDocument()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders no data state when analyticsData is empty', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsCard
                        period={period}
                        analyticsData={[]}
                        journey={undefined}
                        journeyData={
                            {
                                ...mockJourneyData,
                                configuration: {
                                    ...mockJourneyData.configuration,
                                    offer_discount: false,
                                    max_discount_percent: 0,
                                },
                            } as JourneyDetailApiDTO
                        }
                    />
                </Provider>
            </QueryClientProvider>,
        )

        // Assert that sent messages are not displayed
        expect(screen.queryByText('total recipient')).not.toBeInTheDocument()
        expect(screen.queryByText('total recipients')).not.toBeInTheDocument()

        expect(screen.getByText('No data available')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Your Abandoned Cart has not collected any data yet.',
            ),
        ).toBeInTheDocument()
    })

    it('renders draft status when journey is undefined', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsCard
                        period={period}
                        analyticsData={data}
                        journey={undefined}
                        journeyData={mockJourneyData as JourneyDetailApiDTO}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
        expect(screen.getByText('DRAFT')).toBeInTheDocument()
    })

    it('should update journey state when journey state changes', () => {
        const { rerender } = render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsCard
                        period={period}
                        analyticsData={data}
                        journey={{
                            ...mockAbandonedCartJourney,
                            state: JourneyStatusEnum.Draft,
                        }}
                        journeyData={mockJourneyData as JourneyDetailApiDTO}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('DRAFT')).toBeInTheDocument()

        rerender(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsCard
                        period={period}
                        analyticsData={data}
                        journey={{
                            ...mockAbandonedCartJourney,
                            state: JourneyStatusEnum.Active,
                        }}
                        journeyData={mockJourneyData as JourneyDetailApiDTO}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('ACTIVE')).toBeInTheDocument()
    })
})
