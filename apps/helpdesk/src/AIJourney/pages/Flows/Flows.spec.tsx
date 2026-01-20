import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { useParams } from 'react-router-dom'

import { useAIJourneyKpis } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import { useAIJourneyTotalConversations } from 'AIJourney/hooks/useAIJourneyTotalConversations/useAIJourneyTotalConversations'
import { useKpisPerJourney } from 'AIJourney/hooks/useKpisPerJourney/useKpisPerJourney'
import {
    IntegrationsProvider,
    JourneyProvider,
    useIntegrations,
} from 'AIJourney/providers'
import { abandonedCartKpisMock } from 'AIJourney/utils/test-fixtures/abandonedCartKpisMock'
import { journeyKpisMock } from 'AIJourney/utils/test-fixtures/journeyKpisMock'
import { appQueryClient } from 'api/queryClient'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import { shopifyIntegration } from 'fixtures/integrations'
import { mockStore, renderWithRouter } from 'utils/testing'

import { Flows } from './Flows'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

const useParamsMock = jest.mocked(useParams)

jest.mock('AIJourney/providers', () => ({
    ...jest.requireActual('AIJourney/providers'),
    useIntegrations: jest.fn(),
}))

jest.mock('hooks/useAllIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

const useIntegrationsMock = jest.mocked(useIntegrations)

jest.mock('domains/reporting/state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone,
)

jest.mock('AIJourney/queries', () => ({
    ...jest.requireActual('AIJourney/queries'),
    useJourneys: jest.fn(),
    useJourneyData: jest.fn(),
    useUpdateJourney: jest.fn(),
}))
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)
const mockUseJourneyData = require('AIJourney/queries')
    .useJourneyData as jest.Mock
const mockUseUpdateJourney = require('AIJourney/queries')
    .useUpdateJourney as jest.Mock
const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

jest.mock(
    'AIJourney/hooks/useAIJourneyTotalConversations/useAIJourneyTotalConversations',
)
const useAIJourneyTotalConversationsMock = assumeMock(
    useAIJourneyTotalConversations,
)
jest.mock('AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis')
const useAIJourneyKpisMock = assumeMock(useAIJourneyKpis)

jest.mock('AIJourney/hooks/useKpisPerJourney/useKpisPerJourney')
const useKpisPerJourneyMock = assumeMock(useKpisPerJourney)

jest.mock('@repo/feature-flags')
const mockUseFlag = jest.mocked(useFlag)

describe('<Flows />', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlag.mockReturnValue(true)

        useAIJourneyTotalConversationsMock.mockImplementation(() => ({
            label: 'Total Conversations',
            value: 0,
            interpretAs: 'more-is-better',
            metricFormat: 'decimal-precision-1',
            isLoading: false,
        }))

        useAIJourneyKpisMock.mockImplementation(() => ({
            metrics: journeyKpisMock,
        }))

        useKpisPerJourneyMock.mockImplementation(() => ({
            metrics: abandonedCartKpisMock,
        }))

        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                configuration: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    sms_sender_number: '415-111-111',
                    sms_sender_integration_id: 1,
                },
            },
            currentIntegration: { id: 1, name: 'shopify-store' },
            shopName: 'shopify-store',
            isLoading: false,
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
            journeys: [
                {
                    id: 'journey-id',
                    type: 'cart_abandoned',
                    store_name: 'arthur-gorgias',
                    store_type: 'shopify',
                    state: 'active',
                },
            ],
        })

        mockUseUpdateJourney.mockImplementation(() => ({
            mutateAsync: jest.fn().mockResolvedValue({}),
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

        jest.mocked(
            require('hooks/useAllIntegrations').default,
        ).mockReturnValue({
            integrations: [
                {
                    id: 1,
                    type: 'shopify',
                    name: 'teststore1',
                    meta: { shop_name: 'teststore1' },
                },
                {
                    id: 2,
                    type: 'shopify',
                    name: 'teststore2',
                    meta: { shop_name: 'teststore2' },
                },
                {
                    id: 3,
                    type: 'shopify',
                    name: 'teststore3',
                    meta: { shop_name: 'teststore3' },
                },
                {
                    id: 4,
                    type: 'shopify',
                    name: 'teststore4',
                    meta: { shop_name: 'teststore4' },
                },
            ],
        })
    })

    it("should render AI Journey flows page with complete Digest message when discount is disabled and doesn't have follow-ups", () => {
        mockUseJourneyData.mockImplementation(() => ({
            data: {
                configuration: {
                    max_follow_up_messages: null,
                    offer_discount: false,
                    max_discount_percent: 20,
                    sms_sender_number: '415-111-111',
                    sms_sender_integration_id: 1,
                },
            },
            isError: false,
            isLoading: false,
        }))

        renderWithRouter(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <Flows />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('AI Journey Flows')).toBeInTheDocument()
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
                        <JourneyProvider>
                            <Flows />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('AI Journey Flows')).toBeInTheDocument()
    })

    it('filters journeys correctly', async () => {
        renderWithRouter(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <Flows />
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(screen.getByText('Cart Abandoned')).toBeInTheDocument()
            expect(
                screen.getAllByText('Welcome New Subscribers').length,
            ).toEqual(2)
            expect(
                screen.getAllByText('Post-purchase Follow-up').length,
            ).toEqual(2)
            expect(screen.getAllByText('Customer Win-back').length).toEqual(2)
        })

        await act(async () => {
            await userEvent.click(screen.getByText('Active'))
        })
        await waitFor(() => {
            expect(screen.getByText('Cart Abandoned')).toBeInTheDocument()
            expect(
                screen.queryByText('Welcome New Subscribers'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Post-purchase Follow-up'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Customer Win-back'),
            ).not.toBeInTheDocument()
        })

        await act(async () => {
            await userEvent.click(screen.getByText('Coming soon'))
        })
        await waitFor(() => {
            expect(screen.queryByText('Cart Abandoned')).not.toBeInTheDocument()
            expect(
                screen.queryByText('Customer Win-back'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Welcome New Subscribers'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Post-purchase Follow-up'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Browse Abandoned'),
            ).not.toBeInTheDocument()
        })
    })

    it.each([
        { total: 0, expected: 'total recipients' },
        { total: 1, expected: 'total recipient' },
        { total: 42, expected: 'total recipients' },
    ])(
        'should render the total of recipients when $total',
        async ({ total, expected }) => {
            useAIJourneyTotalConversationsMock.mockClear()
            useAIJourneyTotalConversationsMock.mockImplementation(() => ({
                label: 'Total Conversations',
                value: total,
                interpretAs: 'more-is-better',
                metricFormat: 'decimal-precision-1',
                isLoading: false,
            }))

            renderWithRouter(
                <QueryClientProvider client={appQueryClient}>
                    <Provider store={mockStore({})}>
                        <IntegrationsProvider>
                            <JourneyProvider>
                                <Flows />
                            </JourneyProvider>
                        </IntegrationsProvider>
                    </Provider>
                </QueryClientProvider>,
            )

            expect(
                screen.getByText(RegExp(expected), { selector: 'b' }),
            ).toBeInTheDocument()
        },
    )

    it('should show Browse Abandoned journey', async () => {
        renderWithRouter(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <Flows />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(screen.getAllByText('Browse Abandoned').length).toEqual(2)
        })
    })

    it('should display win-back in coming soon', async () => {
        mockUseFlag.mockReturnValue(false)

        renderWithRouter(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <Flows />
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        await act(async () => {
            await userEvent.click(
                screen.getByRole('button', { name: 'Coming soon' }),
            )
        })
        await waitFor(() => {
            expect(screen.queryAllByText('Customer Win-back').length).toEqual(2)
        })
    })
})
