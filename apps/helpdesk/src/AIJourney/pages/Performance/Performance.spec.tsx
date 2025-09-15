import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { useParams } from 'react-router-dom'

import { useAbandonedCartKpis } from 'AIJourney/hooks/useAbandonedCartKpis/useAbandonedCartKpis'
import { useAIJourneyKpis } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import { useAIJourneyTotalConversations } from 'AIJourney/hooks/useAIJourneyTotalConversations/useAIJourneyTotalConversations'
import { IntegrationsProvider, useIntegrations } from 'AIJourney/providers'
import { abandonedCartKpisMock } from 'AIJourney/utils/test-fixtures/abandonedCartKpisMock'
import { journeyKpisMock } from 'AIJourney/utils/test-fixtures/journeyKpisMock'
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

jest.mock('hooks/useAllIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
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
const mockUseJourneys = require('AIJourney/queries').useJourneys as jest.Mock
const mockUseJourneyData = require('AIJourney/queries')
    .useJourneyData as jest.Mock
const mockUseUpdateJourney = require('AIJourney/queries')
    .useUpdateJourney as jest.Mock

jest.mock(
    'AIJourney/hooks/useAIJourneyTotalConversations/useAIJourneyTotalConversations',
)
const useAIJourneyTotalConversationsMock = assumeMock(
    useAIJourneyTotalConversations,
)
jest.mock('AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis')
const useAIJourneyKpisMock = assumeMock(useAIJourneyKpis)

jest.mock('AIJourney/hooks/useAbandonedCartKpis/useAbandonedCartKpis')
const useAbandonedCartKpisMock = assumeMock(useAbandonedCartKpis)

describe('<Performance />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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

        useAbandonedCartKpisMock.mockImplementation(() => ({
            metrics: abandonedCartKpisMock,
        }))

        mockUseJourneys.mockImplementation(() => ({
            data: [
                { id: 'journey-123', type: 'cart_abandoned', state: 'active' },
            ],
            isError: false,
            isLoading: false,
        }))

        mockUseJourneyData.mockImplementation(() => ({
            data: {
                configuration: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    sms_sender_number: '415-111-111',
                    sms_sender_integration_id: 1,
                },
            },
            isError: false,
            isLoading: false,
        }))

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

    it("should render AI Journey performance page with complete Digest message when discount is disabled and doesn't have follow-ups", () => {
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
                        <Performance />
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
        expect(
            screen.getByText(
                'To drive more revenue, consider enabling the Discount Code skill or Follow-up messages.',
                { exact: false },
            ),
        ).toBeInTheDocument()
    })

    it('should render AI Journey performance page with discount suggestion when discount is disabled and has follow-ups', () => {
        mockUseJourneyData.mockImplementation(() => ({
            data: {
                configuration: {
                    max_follow_up_messages: 3,
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
                        <Performance />
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
        expect(
            screen.getByText(
                'To drive more revenue, consider enabling the Discount Code skill.',
                { exact: false },
            ),
        ).toBeInTheDocument()
    })

    it("should render AI Journey performance page with follow-up suggestion when doesn't have follow-ups and discount is enabled", () => {
        mockUseJourneyData.mockImplementation(() => ({
            data: {
                configuration: {
                    max_follow_up_messages: null,
                    offer_discount: true,
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
                        <Performance />
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
        expect(
            screen.getByText(
                'To drive more revenue, consider enabling the Follow-up messages.',
                { exact: false },
            ),
        ).toBeInTheDocument()
    })

    it('should render AI Journey performance page with no suggestions when has follow-ups and discount is enabled', () => {
        mockUseJourneyData.mockImplementation(() => ({
            data: {
                configuration: {
                    max_follow_up_messages: 2,
                    offer_discount: true,
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
                        <Performance />
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
        expect(
            screen.queryByText('To drive more revenue, consider enabling the', {
                exact: false,
            }),
        ).not.toBeInTheDocument()
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

        await act(async () => {
            await userEvent.click(screen.getByText('Active'))
        })
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

        await act(async () => {
            await userEvent.click(screen.getByText('Coming soon'))
        })
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
                            <Performance />
                        </IntegrationsProvider>
                    </Provider>
                </QueryClientProvider>,
            )

            expect(
                screen.getByText(RegExp(expected), { selector: 'b' }),
            ).toBeInTheDocument()
        },
    )
})
