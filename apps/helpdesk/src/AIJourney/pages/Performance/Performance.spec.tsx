import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { useParams } from 'react-router-dom'

import { IntegrationsProvider, useIntegrations } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import { shopifyIntegration } from 'fixtures/integrations'
import { mockStore, renderWithRouter } from 'utils/testing'

import { Performance } from './Performance'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

const useParamsMock = jest.mocked(useParams)

jest.mock('AIJourney/providers', () => ({
    ...jest.requireActual('AIJourney/providers'),
    useIntegrations: jest.fn(),
}))

const useIntegrationsMock = jest.mocked(useIntegrations)

jest.mock('domains/reporting/state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone,
)

jest.mock('AIJourney/queries', () => ({
    ...jest.requireActual('AIJourney/queries'),
    useJourneys: jest.fn(),
}))
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)
const mockUseJourneys = require('AIJourney/queries').useJourneys as jest.Mock

describe('<Performance />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneys.mockImplementation(() => ({
            data: [
                { id: 'journey-123', type: 'cart_abandoned', state: 'active' },
            ],
            isError: false,
            isLoading: false,
        }))

        useParamsMock.mockReturnValue({
            shopName: 'testShop',
        })

        useIntegrationsMock.mockReturnValue({
            currentIntegration: shopifyIntegration,
            integrations: [],
            isLoading: false,
        })

        const cleanStatsFilters = {
            period: {
                start_datetime: '1970-01-01T00:00:00+00:00',
                end_datetime: '1970-01-01T00:00:00+00:00',
            },
        }

        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            userTimezone: 'someTimezone',
            cleanStatsFilters,
            granularity: ReportingGranularity.Day,
        })
    })

    it('should render AI Journey performance page', () => {
        renderWithRouter(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <Performance />
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
    })

    it('missing integration should not break the page', () => {
        useIntegrationsMock.mockReturnValue({
            currentIntegration: undefined,
            integrations: [],
            isLoading: false,
        })

        renderWithRouter(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <Performance />
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
    })

    it('filters journeys correctly', async () => {
        renderWithRouter(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <Performance />
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
            expect(
                screen.getAllByText('Welcome New Subscribers').length,
            ).toBeGreaterThan(0)
            expect(
                screen.getAllByText('Post-Purchase Follow-up').length,
            ).toBeGreaterThan(0)
            expect(
                screen.getAllByText('Customer Winback').length,
            ).toBeGreaterThan(0)
        })

        await userEvent.click(screen.getByText('Active'))
        await waitFor(() => {
            expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
            expect(
                screen.queryByText('Welcome New Subscribers'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Post-Purchase Follow-up'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Customer Winback'),
            ).not.toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Coming soon'))
        await waitFor(() => {
            expect(screen.queryByText('Abandoned Cart')).not.toBeInTheDocument()
            expect(
                screen.getAllByText('Welcome New Subscribers').length,
            ).toBeGreaterThan(0)
            expect(
                screen.getAllByText('Post-Purchase Follow-up').length,
            ).toBeGreaterThan(0)
            expect(
                screen.getAllByText('Customer Winback').length,
            ).toBeGreaterThan(0)
        })
    })
})
