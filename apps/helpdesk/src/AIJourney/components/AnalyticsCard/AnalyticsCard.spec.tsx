import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { Location } from 'history'
import { Provider } from 'react-redux'
import { MemoryRouter, useLocation, useParams } from 'react-router-dom'

import { JourneyStatusEnum, JourneyTypeEnum } from '@gorgias/convert-client'

import { IntegrationsProvider, JourneyProvider } from 'AIJourney/providers'
import {
    abandonedCartKpisMock,
    emptyAbandonedCartKpisMock,
    loadingAbandonedCartKpisMock,
} from 'AIJourney/utils/test-fixtures/abandonedCartKpisMock'
import { appQueryClient } from 'api/queryClient'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import { mockStore } from 'utils/testing'

import { AnalyticsCard } from './AnalyticsCard'

jest.mock('AIJourney/components/DiscountCard/DiscountCard', () => ({
    DiscountCard: () => <div data-testid="discount-card" />,
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useLocation: jest.fn(),
}))

const useParamsMock = jest.mocked(useParams)
const useLocationMock = jest.mocked(useLocation)

jest.mock('domains/reporting/state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone,
)

const mockHandleUpdate = jest.fn()
const mockMetrics = jest.fn()
jest.mock('AIJourney/hooks', () => ({
    useJourneyUpdateHandler: () => ({
        handleUpdate: mockHandleUpdate,
    }),
    useKpisPerJourney: () => ({
        metrics: mockMetrics(),
    }),
}))

const period = {
    start: '1970-01-01T00:00:00+00:00',
    end: '1970-01-01T00:00:00+00:00',
}

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

const cleanStatsFilters = {
    period: {
        start_datetime: '1970-01-01T00:00:00+00:00',
        end_datetime: '1970-01-01T00:00:00+00:00',
    },
}

describe('<AnalyticsCard />', () => {
    beforeEach(() => {
        appQueryClient.clear()
        useParamsMock.mockReturnValue({ shopName: 'test-shop' })

        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            userTimezone: 'someTimezone',
            cleanStatsFilters,
            granularity: ReportingGranularity.Day,
        })

        useLocationMock.mockReturnValue({
            pathname: '/app/ai-journey/test-shop/performance',
        } as Location)

        mockMetrics.mockReturnValue(abandonedCartKpisMock)
    })

    it('renders active status with correct badge and icon', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <AnalyticsCard
                                integrationId={123}
                                period={period}
                                journey={mockAbandonedCartJourney}
                            />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )
        expect(screen.getByText('Cart Abandoned')).toBeInTheDocument()
        expect(screen.getByText('ACTIVE')).toBeInTheDocument()
        expect(screen.getByTestId('discount-card')).toBeInTheDocument()
        const img = screen.getByAltText('sphere-icon')
        expect(img).toBeInTheDocument()
    })

    it('renders paused status with correct badge and icon', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <AnalyticsCard
                                integrationId={123}
                                period={period}
                                journey={{
                                    ...mockAbandonedCartJourney,
                                    state: JourneyStatusEnum.Paused,
                                }}
                            />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )
        expect(screen.getByText('Cart Abandoned')).toBeInTheDocument()
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
                        <IntegrationsProvider>
                            <JourneyProvider>
                                <AnalyticsCard
                                    period={period}
                                    journey={{
                                        ...mockAbandonedCartJourney,
                                        message_instructions:
                                            'Custom message instructions for pause test',
                                    }}
                                    integrationId={12345}
                                />
                            </JourneyProvider>
                        </IntegrationsProvider>
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
                        <IntegrationsProvider>
                            <JourneyProvider>
                                <AnalyticsCard
                                    period={period}
                                    journey={{
                                        ...mockAbandonedCartJourney,
                                        state: JourneyStatusEnum.Paused,
                                        message_instructions:
                                            'Custom message instructions for activate test',
                                    }}
                                    integrationId={12345}
                                />
                            </JourneyProvider>
                        </IntegrationsProvider>
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
        mockMetrics.mockClear()
        mockMetrics.mockReturnValue(loadingAbandonedCartKpisMock)

        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <AnalyticsCard
                                integrationId={123}
                                period={period}
                                journey={mockAbandonedCartJourney}
                            />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        // Assert that sent messages are not displayed
        expect(screen.queryByText('total recipient')).not.toBeInTheDocument()
        expect(screen.queryByText('total recipients')).not.toBeInTheDocument()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders no data state when analyticsData is empty', () => {
        mockMetrics.mockClear()
        mockMetrics.mockReturnValue(emptyAbandonedCartKpisMock)

        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <AnalyticsCard
                                integrationId={123}
                                period={period}
                                journey={mockAbandonedCartJourney}
                            />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        // Assert that sent messages are not displayed
        expect(screen.queryByText('total recipient')).not.toBeInTheDocument()
        expect(screen.queryByText('total recipients')).not.toBeInTheDocument()

        expect(screen.getByText('No data available')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Your Cart Abandoned has not collected any data yet.',
            ),
        ).toBeInTheDocument()
    })

    it('should update journey state when journey state changes', () => {
        const { rerender } = render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <AnalyticsCard
                                integrationId={123}
                                period={period}
                                journey={{
                                    ...mockAbandonedCartJourney,
                                    state: JourneyStatusEnum.Draft,
                                }}
                            />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('DRAFT')).toBeInTheDocument()

        rerender(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <AnalyticsCard
                                integrationId={123}
                                period={period}
                                journey={{
                                    ...mockAbandonedCartJourney,
                                    state: JourneyStatusEnum.Active,
                                }}
                            />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('ACTIVE')).toBeInTheDocument()
    })
})
