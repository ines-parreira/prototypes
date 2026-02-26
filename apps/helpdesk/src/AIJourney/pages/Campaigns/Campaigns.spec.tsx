import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    DEFAULT_TABLE_METRICS,
    useAIJourneyTableKpis,
} from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import { JourneyProvider } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getCleanStatsFiltersWithLogicalOperatorsWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import { account } from 'fixtures/account'
import { renderWithRouter } from 'utils/testing'

import { Campaigns } from './Campaigns'

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

jest.mock('domains/reporting/state/ui/stats/selectors')
const getCleanStatsFiltersWithLogicalOperatorsWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
)

jest.mock('AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis')
const useAIJourneyTableKpisMock = assumeMock(useAIJourneyTableKpis)

jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)

jest.mock('domains/reporting/pages/common/filters/FiltersPanelWrapper', () => ({
    __esModule: true,
    default: () => <div data-testid="filters-panel-wrapper" />,
}))

describe('<Campaigns />', () => {
    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS(account),
        integrations: fromJS({ integrations: [] }),
    })
    const cleanStatsFilters = {
        period: {
            start_datetime: '1970-01-01T00:00:00+00:00',
            end_datetime: '1970-01-01T00:00:00+00:00',
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyContext.mockReturnValue({
            campaigns: [
                { id: '1', campaign: { title: 'Campaign 1', state: 'active' } },
                {
                    id: '2',
                    campaign: { title: 'Campaign 2', state: 'inactive' },
                },
            ],
            isLoadingIntegrations: false,
            currentIntegration: { id: 1, name: 'Test Integration' },
        })

        getCleanStatsFiltersWithLogicalOperatorsWithTimezoneMock.mockReturnValue(
            {
                userTimezone: 'someTimezone',
                cleanStatsFilters,
                granularity: ReportingGranularity.Day,
            },
        )

        useAIJourneyTableKpisMock.mockImplementation(() => ({
            metrics: {
                '1': {
                    ...DEFAULT_TABLE_METRICS,
                    recipients: 15567,
                },
            },
            isLoading: false,
        }))
    })

    it('should render the campaigns page', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Campaigns />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByRole('heading', { name: /campaigns/i }),
        ).toBeInTheDocument()
    })

    it('should render the campaigns table with data', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Campaigns />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(screen.getAllByText('Campaign 1')).toHaveLength(1)
        expect(screen.getAllByText('Campaign 2')).toHaveLength(1)
        expect(screen.getByText('Create campaign')).toBeInTheDocument()
        expect(screen.getByText('15,567')).toBeInTheDocument()
    })

    it('should render empty state when no campaigns', () => {
        mockUseJourneyContext.mockReturnValue({
            campaigns: [],
            isLoadingIntegrations: false,
        })

        useAIJourneyTableKpisMock.mockImplementation(() => ({
            metrics: {},
            isLoading: true,
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Campaigns />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByText('Create your first campaign'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Start reaching your customers today'),
        ).toBeInTheDocument()
    })

    it('should not fetch metrics when journeys are loading', () => {
        mockUseJourneyContext.mockReturnValue({
            campaigns: [
                { id: '1', campaign: { title: 'Campaign 1', state: 'active' } },
            ],
            isLoadingJourneys: true,
            isLoadingIntegrations: false,
            currentIntegration: { id: 1, name: 'Test Integration' },
        })

        useAIJourneyTableKpisMock.mockImplementation(() => ({
            metrics: {},
            isLoading: false,
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Campaigns />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(useAIJourneyTableKpisMock).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
        )
    })

    it('should not fetch metrics when there are no campaigns', () => {
        mockUseJourneyContext.mockReturnValue({
            campaigns: [],
            isLoadingJourneys: false,
            isLoadingIntegrations: false,
            currentIntegration: { id: 1, name: 'Test Integration' },
        })

        useAIJourneyTableKpisMock.mockImplementation(() => ({
            metrics: {},
            isLoading: false,
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Campaigns />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(useAIJourneyTableKpisMock).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
        )
    })

    it('should fetch metrics when journeys are loaded and campaigns exist', () => {
        mockUseJourneyContext.mockReturnValue({
            campaigns: [
                { id: '1', campaign: { title: 'Campaign 1', state: 'active' } },
                {
                    id: '2',
                    campaign: { title: 'Campaign 2', state: 'inactive' },
                },
            ],
            isLoadingJourneys: false,
            isLoadingIntegrations: false,
            currentIntegration: { id: 1, name: 'Test Integration' },
        })

        useAIJourneyTableKpisMock.mockImplementation(() => ({
            metrics: {
                '1': {
                    ...DEFAULT_TABLE_METRICS,
                    recipients: 100,
                },
                '2': {
                    ...DEFAULT_TABLE_METRICS,
                    recipients: 200,
                },
            },
            isLoading: false,
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Campaigns />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(useAIJourneyTableKpisMock).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: true,
                journeyIds: ['1', '2'],
            }),
        )
    })
})
