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
import { useCampaignsKpis } from 'AIJourney/hooks/useCampaignsKpis/useCampaignsKpis'
import { IntegrationsProvider, JourneyProvider } from 'AIJourney/providers'
import { journeyKpisMock } from 'AIJourney/utils/test-fixtures/journeyKpisMock'
import { appQueryClient } from 'api/queryClient'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
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
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone,
)

jest.mock('AIJourney/hooks/useCampaignsKpis/useCampaignsKpis')
const useCampaignsKpisMock = assumeMock(useCampaignsKpis)

jest.mock('AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis')
const useAIJourneyTableKpisMock = assumeMock(useAIJourneyTableKpis)

jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)

describe('<Campaigns />', () => {
    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS(account),
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

        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            userTimezone: 'someTimezone',
            cleanStatsFilters,
            granularity: ReportingGranularity.Day,
        })

        useCampaignsKpisMock.mockImplementation(() => ({
            metrics: journeyKpisMock,
        }))

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
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <Campaigns />
                        </JourneyProvider>
                    </IntegrationsProvider>
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
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <Campaigns />
                        </JourneyProvider>
                    </IntegrationsProvider>
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
        useCampaignsKpisMock.mockImplementation(() => ({
            metrics: [
                {
                    label: 'Total Revenue',
                    value: 59.99,
                    prevValue: 180.02,
                    series: [],
                    interpretAs: 'more-is-better',
                    metricFormat: 'currency',
                    currency: 'USD',
                    isLoading: true,
                },
            ],
        }))

        useAIJourneyTableKpisMock.mockImplementation(() => ({
            metrics: {},
            isLoading: true,
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <Campaigns />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByText('Create your first campaign'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Start reaching your customers today'),
        ).toBeInTheDocument()
        expect(screen.getByText('No data available yet')).toBeInTheDocument()
    })
})
