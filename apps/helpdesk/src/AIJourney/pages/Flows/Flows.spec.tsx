import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useLocalStorage } from '@repo/hooks'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { JourneyStatusEnum, JourneyTypeEnum } from '@gorgias/convert-client'

import { useAIJourneyTableKpis } from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import { useJourneyContext } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import { ThemeProvider } from 'core/theme'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { initialState as drillDownInitialState } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { shopifyIntegration } from 'fixtures/integrations'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

import { Flows } from './Flows'

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

const mockUseJourneyContext = assumeMock(useJourneyContext)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis')
const useAIJourneyTableKpisMock = assumeMock(useAIJourneyTableKpis)

jest.mock('@repo/feature-flags')
const mockUseFlag = assumeMock(useFlag)

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useLocalStorage: jest.fn(),
}))
const mockUseLocalStorage = assumeMock(useLocalStorage)

jest.mock('domains/reporting/pages/common/filters/FiltersPanelWrapper', () => ({
    __esModule: true,
    default: () => <div>Filters Panel</div>,
}))

jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    ConfigureMetricsModal: ({
        isOpen,
    }: {
        isOpen: boolean
        onClose: () => void
    }) => (isOpen ? <div>Configure Metrics Modal</div> : null),
}))

const mockJourneyContextDefaults = {
    campaigns: undefined,
    journeyData: undefined,
    currentIntegration: shopifyIntegration,
    currency: 'USD',
    shopName: 'test-store',
    isLoading: false,
    isLoadingJourneys: false,
    isLoadingJourneyData: false,
    isLoadingIntegrations: false,
    journeyType: 'cart_abandoned' as any,
    storeConfiguration: undefined,
}

const renderComponent = () => {
    const initialState: Partial<RootState> = {
        ui: {
            stats: {
                drillDown: drillDownInitialState,
            },
        } as RootState['ui'],
    }

    return render(
        <MemoryRouter>
            <Provider store={mockStore(initialState)}>
                <QueryClientProvider client={appQueryClient}>
                    <ThemeProvider>
                        <Flows />
                    </ThemeProvider>
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>,
    )
}

describe('<Flows />', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlag.mockReturnValue(true)
        mockUseLocalStorage.mockReturnValue([[], jest.fn(), jest.fn()])

        const cleanStatsFilters = {
            period: {
                start_datetime: '1970-01-01T00:00:00+00:00',
                end_datetime: '1970-01-01T00:00:00+00:00',
            },
        }

        useStatsFiltersMock.mockReturnValue({
            userTimezone: 'UTC',
            cleanStatsFilters,
            granularity: ReportingGranularity.Day,
        })

        useAIJourneyTableKpisMock.mockReturnValue({
            metrics: {},
            isLoading: false,
        })

        mockUseJourneyContext.mockReturnValue({
            ...mockJourneyContextDefaults,
            journeys: [
                {
                    id: 'journey-1',
                    type: JourneyTypeEnum.CartAbandoned,
                    store_name: 'test-store',
                    store_type: 'shopify',
                    state: JourneyStatusEnum.Active,
                    store_integration_id: 1,
                    created_datetime: '2024-01-01T00:00:00Z',
                    account_id: 1,
                },
            ],
        })
    })

    describe('Rendering', () => {
        it('should render the Flows page', () => {
            renderComponent()

            expect(screen.getByText('Flows')).toBeInTheDocument()
            expect(screen.getByText('Filters Panel')).toBeInTheDocument()
        })

        it('should render JourneysTable with configured flows', () => {
            renderComponent()

            expect(screen.getByRole('table')).toBeInTheDocument()
            expect(screen.getByText('Cart Abandoned')).toBeInTheDocument()
        })

        it('should render unconfigured flows when feature flags are enabled', () => {
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            renderComponent()

            expect(screen.getByText('Cart Abandoned')).toBeInTheDocument()
            expect(screen.getByText('Browse Abandoned')).toBeInTheDocument()
            expect(screen.getByText('Welcome')).toBeInTheDocument()
            expect(screen.getByText('Customer Win-back')).toBeInTheDocument()
        })

        it('should not render disabled flows', () => {
            mockUseFlag.mockReturnValue(false)

            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            renderComponent()

            expect(
                screen.queryByText('Customer Win-back'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Metrics display', () => {
        it('should display metrics for configured flows', () => {
            useAIJourneyTableKpisMock.mockReturnValue({
                metrics: {
                    'journey-1': {
                        recipients: 100,
                        ctr: 0.5,
                        replyRate: 0.3,
                        optOutRate: 0.1,
                        messagesSent: 200,
                        revenue: 1000,
                        totalOrders: 10,
                        averageOrderValue: 100,
                        revenuePerRecipient: 10,
                        conversionRate: 0.1,
                    },
                },
                isLoading: false,
            })

            renderComponent()

            expect(screen.getByText('100')).toBeInTheDocument()
        })

        it('should show loading state when metrics are loading', () => {
            useAIJourneyTableKpisMock.mockReturnValue({
                metrics: {},
                isLoading: true,
            })

            renderComponent()

            expect(screen.getByRole('table')).toBeInTheDocument()
        })

        it('should display empty metrics for unconfigured flows', () => {
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            renderComponent()

            expect(screen.getByText('Cart Abandoned')).toBeInTheDocument()
            expect(screen.getByText('Welcome')).toBeInTheDocument()
        })
    })

    describe('Configure metrics modal', () => {
        it('should open configure metrics modal when edit button is clicked', async () => {
            const user = userEvent.setup()

            renderComponent()

            const editButton = screen.getByRole('button', {
                name: /edit table/i,
            })
            await user.click(editButton)

            expect(
                screen.getByText('Configure Metrics Modal'),
            ).toBeInTheDocument()
        })
    })

    describe('Integration handling', () => {
        it('should handle missing integration', () => {
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
                currentIntegration: undefined,
                shopName: '',
            })

            renderComponent()

            expect(screen.getByText('Flows')).toBeInTheDocument()
        })

        it('should use integration ID for metrics query', () => {
            const integrationWithId123 = { ...shopifyIntegration, id: 123 }
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [
                    {
                        id: 'journey-1',
                        type: JourneyTypeEnum.CartAbandoned,
                        store_name: 'test-store',
                        store_type: 'shopify',
                        state: JourneyStatusEnum.Active,
                        store_integration_id: 123,
                        created_datetime: '2024-01-01T00:00:00Z',
                        account_id: 1,
                    },
                ],
                currentIntegration: integrationWithId123,
            })

            renderComponent()

            expect(useAIJourneyTableKpisMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    integrationId: '123',
                }),
            )
        })
    })

    describe('Feature flags', () => {
        it('should show Win-back flow when feature flag is enabled', () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiJourneyWinBackEnabled) return true
                return false
            })

            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            renderComponent()

            expect(screen.getByText('Customer Win-back')).toBeInTheDocument()
        })

        it('should show Welcome flow when feature flag is enabled', () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiJourneyWelcomeFlowEnabled)
                    return true
                return false
            })

            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            renderComponent()

            expect(screen.getByText('Welcome')).toBeInTheDocument()
        })

        it('should show Post-purchase flow when feature flag is disabled', () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiJourneyPostPurchaseEnabled)
                    return false
                return true
            })

            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            renderComponent()

            expect(screen.getByText('Post-purchase')).toBeInTheDocument()
        })
    })

    describe('Column visibility based on user preferences', () => {
        it('should display column headers according to visibility settings', () => {
            mockUseLocalStorage.mockReturnValue([
                [
                    {
                        id: 'recipients',
                        label: 'Total Recipients',
                        visibility: true,
                    },
                    {
                        id: 'ctr',
                        label: 'CTR',
                        visibility: true,
                    },
                    {
                        id: 'revenue',
                        label: 'Revenue',
                        visibility: false,
                    },
                ],
                jest.fn(),
                jest.fn(),
            ])

            renderComponent()

            const table = screen.getByRole('table')
            const headers = Array.from(table.querySelectorAll('th')).map(
                (th) => th.textContent,
            )

            expect(headers.join(',')).toContain('Recipients')
            expect(headers.join(',')).toContain('CTR')
            expect(headers.join(',')).not.toContain('Revenue')
        })

        it('should order metric columns according to user preference configuration', () => {
            mockUseLocalStorage.mockReturnValue([
                [
                    {
                        id: 'conversionRate',
                        label: 'Conversion Rate',
                        visibility: true,
                    },
                    {
                        id: 'ctr',
                        label: 'CTR',
                        visibility: true,
                    },
                    {
                        id: 'recipients',
                        label: 'Total Recipients',
                        visibility: true,
                    },
                ],
                jest.fn(),
                jest.fn(),
            ])

            renderComponent()

            const table = screen.getByRole('table')
            const headers = Array.from(table.querySelectorAll('th')).map(
                (th) => th.textContent,
            )

            const conversionRateIndex = headers.findIndex((h) =>
                h?.includes('Conversion'),
            )
            const ctrIndex = headers.findIndex((h) => h?.includes('CTR'))
            const recipientsIndex = headers.findIndex((h) =>
                h?.includes('Recipients'),
            )

            expect(conversionRateIndex).toBeGreaterThan(-1)
            expect(ctrIndex).toBeGreaterThan(-1)
            expect(recipientsIndex).toBeGreaterThan(-1)
            expect(conversionRateIndex).toBeLessThan(ctrIndex)
            expect(ctrIndex).toBeLessThan(recipientsIndex)
        })

        it('should handle columns with both id and accessorKey properties', () => {
            mockUseLocalStorage.mockReturnValue([
                [
                    {
                        id: 'averageOrderValue',
                        label: 'Average Order Value',
                        visibility: true,
                    },
                    {
                        id: 'messagesSent',
                        label: 'Messages Sent',
                        visibility: true,
                    },
                ],
                jest.fn(),
                jest.fn(),
            ])

            renderComponent()

            const table = screen.getByRole('table')
            const headers = Array.from(table.querySelectorAll('th')).map(
                (th) => th.textContent,
            )

            expect(headers.join(',')).toContain('AOV')
            expect(headers.join(',')).toContain('Messages Sent')
        })
    })
})
