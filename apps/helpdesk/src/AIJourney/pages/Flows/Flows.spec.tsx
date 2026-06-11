import { appQueryClient } from '@repo/api-resources'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { useLocalStorage } from '@gorgias/toolkit-react'

import { JourneyStatusEnum, JourneyTypeEnum } from '@gorgias/convert-client'

import { journeyTableDataMetrics } from 'AIJourney/components/JourneysTable/constants'
import { JOURNEY_TYPES } from 'AIJourney/constants'
import { useAIJourneyTableKpis } from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import { useJourneyContext } from 'AIJourney/providers'
import type { FlowsListResponse } from 'AIJourney/queries/useCustomFlows/useCustomFlows'
import {
    CUSTOM_FLOWS_PAGE_SIZE,
    useFlowsList,
} from 'AIJourney/queries/useCustomFlows/useCustomFlows'
import { ThemeProvider } from 'core/theme'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { initialState as drillDownInitialState } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { shopifyIntegration } from 'fixtures/integrations'
import { useSearchParam } from 'hooks/useSearchParam'
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

jest.mock('@gorgias/toolkit-react', () => ({
    ...jest.requireActual('@gorgias/toolkit-react'),
    useLocalStorage: jest.fn(),
}))
const mockUseLocalStorage = assumeMock(useLocalStorage)

jest.mock('domains/reporting/pages/common/filters/FiltersPanelWrapper', () => ({
    __esModule: true,
    FiltersPanelWrapper: () => <div>Filters Panel</div>,
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

jest.mock('AIJourney/queries/useCustomFlows/useCustomFlows', () => ({
    ...jest.requireActual('AIJourney/queries/useCustomFlows/useCustomFlows'),
    useFlowsList: jest.fn(),
}))
const mockUseFlowsList = useFlowsList as jest.Mock

jest.mock('hooks/useSearchParam')
const mockSetPageParam = jest.fn()
const mockUseSearchParam = useSearchParam as jest.Mock

const mockJourneyContextDefaults = {
    campaigns: undefined,
    journeyData: undefined,
    currentIntegration: shopifyIntegration,
    currency: 'USD',
    shopName: 'test-store',
    isLoading: false,
    isLoadingJourneys: false,
    isLoadingJourneyData: false,
    isErrorJourneyData: false,
    isLoadingIntegrations: false,
    journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
    storeConfiguration: undefined,
}

const emptyFlowsList: FlowsListResponse = {
    built_in: [],
    custom: [],
}

const renderComponent = (initialSearch = '') => {
    const initialState: Partial<RootState> = {
        ui: {
            stats: {
                drillDown: drillDownInitialState,
            },
        } as RootState['ui'],
    }

    return render(
        <MemoryRouter initialEntries={[`/${initialSearch}`]}>
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

        mockUseSearchParam.mockReturnValue([null, mockSetPageParam])
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

        mockUseFlowsList.mockReturnValue({
            data: emptyFlowsList,
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

        it('should render all unconfigured flows when the flows list is empty', () => {
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            renderComponent()

            expect(screen.getByText('Cart Abandoned')).toBeInTheDocument()
            expect(screen.getByText('Browse Abandoned')).toBeInTheDocument()
            expect(screen.getByText('Welcome')).toBeInTheDocument()
            expect(screen.getByText('Customer Win-back')).toBeInTheDocument()
            expect(screen.getByText('Post-purchase')).toBeInTheDocument()
        })
    })

    describe('Built-in flow sort order', () => {
        it('should render built-in flows in alphabetical order', () => {
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            renderComponent()

            const table = screen.getByRole('table')
            const rows = Array.from(table.querySelectorAll('tbody tr'))
            const flowNames = rows
                .map((row) => row.textContent?.trim())
                .filter(Boolean)

            const browseIdx = flowNames.findIndex((n) =>
                n?.includes('Browse Abandoned'),
            )
            const cartIdx = flowNames.findIndex((n) =>
                n?.includes('Cart Abandoned'),
            )
            const welcomeIdx = flowNames.findIndex((n) =>
                n?.includes('Welcome'),
            )
            const winBackIdx = flowNames.findIndex((n) =>
                n?.includes('Customer Win-back'),
            )

            expect(browseIdx).toBeGreaterThan(-1)
            expect(cartIdx).toBeGreaterThan(-1)
            expect(welcomeIdx).toBeGreaterThan(-1)
            expect(winBackIdx).toBeGreaterThan(-1)
            expect(browseIdx).toBeLessThan(cartIdx)
            expect(cartIdx).toBeLessThan(welcomeIdx)
            expect(welcomeIdx).toBeLessThan(winBackIdx)
        })

        it('should render Browse Abandoned first', () => {
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            renderComponent()

            const table = screen.getByRole('table')
            const rows = Array.from(table.querySelectorAll('tbody tr'))
            expect(rows[0]?.textContent).toContain('Browse Abandoned')
        })

        it('should render Win Back last among built-ins', () => {
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            mockUseFlowsList.mockReturnValue({
                data: emptyFlowsList,
                isLoading: false,
            })

            renderComponent()

            const table = screen.getByRole('table')
            const rows = Array.from(table.querySelectorAll('tbody tr'))
            const lastBuiltIn = rows[rows.length - 1]
            expect(lastBuiltIn?.textContent).toContain('Customer Win-back')
        })
    })

    describe('Custom flows', () => {
        it('should render custom flows after built-in flows', () => {
            const customFlow = {
                id: 'custom-1',
                // SDK's JourneyTypeEnum does not yet include 'custom'; cast to avoid never
                type: 'custom' as unknown as JourneyTypeEnum,
                name: 'My Custom Flow',
                store_name: 'test-store',
                store_type: 'shopify',
                state: JourneyStatusEnum.Active,
                store_integration_id: 1,
                created_datetime: '2024-01-01T00:00:00Z',
                account_id: 1,
            }

            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            mockUseFlowsList.mockReturnValue({
                data: {
                    built_in: [],
                    custom: [customFlow],
                } as FlowsListResponse,
                isLoading: false,
            })

            renderComponent()

            const table = screen.getByRole('table')
            const rows = Array.from(table.querySelectorAll('tbody tr'))
            const lastRow = rows[rows.length - 1]
            expect(lastRow?.textContent).toContain('My Custom Flow')
        })

        it('should sort custom flows alphabetically by name', () => {
            const customFlows = [
                {
                    id: 'custom-z',
                    // SDK's JourneyTypeEnum does not yet include 'custom'; cast to avoid never
                    type: 'custom' as unknown as JourneyTypeEnum,
                    name: 'Zebra Flow',
                    store_name: 'test-store',
                    store_type: 'shopify',
                    state: JourneyStatusEnum.Active,
                    store_integration_id: 1,
                    created_datetime: '2024-01-01T00:00:00Z',
                    account_id: 1,
                },
                {
                    id: 'custom-a',
                    // SDK's JourneyTypeEnum does not yet include 'custom'; cast to avoid never
                    type: 'custom' as unknown as JourneyTypeEnum,
                    name: 'Alpha Flow',
                    store_name: 'test-store',
                    store_type: 'shopify',
                    state: JourneyStatusEnum.Active,
                    store_integration_id: 1,
                    created_datetime: '2024-01-01T00:00:00Z',
                    account_id: 1,
                },
            ]

            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            mockUseFlowsList.mockReturnValue({
                data: {
                    built_in: [],
                    custom: customFlows,
                } as FlowsListResponse,
                isLoading: false,
            })

            renderComponent()

            const table = screen.getByRole('table')
            const rows = Array.from(table.querySelectorAll('tbody tr'))
            const alphaIdx = rows.findIndex((r) =>
                r.textContent?.includes('Alpha Flow'),
            )
            const zebraIdx = rows.findIndex((r) =>
                r.textContent?.includes('Zebra Flow'),
            )

            expect(alphaIdx).toBeGreaterThan(-1)
            expect(zebraIdx).toBeGreaterThan(-1)
            expect(alphaIdx).toBeLessThan(zebraIdx)
        })
    })

    describe('Pagination', () => {
        it('should not show pagination when custom flows do not exceed page size', () => {
            mockUseFlowsList.mockReturnValue({
                data: {
                    built_in: [],
                    custom: [],
                } as FlowsListResponse,
                isLoading: false,
            })

            renderComponent()

            expect(
                screen.queryByRole('navigation', { name: /pagination/i }),
            ).not.toBeInTheDocument()
        })

        it('should show pagination controls when total custom flows exceed page size', () => {
            const customFlows = Array.from(
                { length: CUSTOM_FLOWS_PAGE_SIZE + 1 },
                (_, i) => ({
                    id: `custom-${i}`,
                    type: 'custom' as unknown as JourneyTypeEnum,
                    name: `Flow ${String(i).padStart(2, '0')}`,
                    store_name: 'test-store',
                    store_type: 'shopify',
                    state: JourneyStatusEnum.Active,
                    store_integration_id: 1,
                    created_datetime: '2024-01-01T00:00:00Z',
                    account_id: 1,
                }),
            )

            mockUseFlowsList.mockReturnValue({
                data: {
                    built_in: [],
                    custom: customFlows,
                } as FlowsListResponse,
                isLoading: false,
            })

            renderComponent()

            expect(
                screen.getByRole('navigation', { name: /pagination/i }),
            ).toBeInTheDocument()
        })

        it('should not show flows beyond the first page by default', () => {
            const customFlows = Array.from(
                { length: CUSTOM_FLOWS_PAGE_SIZE + 5 },
                (_, i) => ({
                    id: `custom-${i}`,
                    type: 'custom' as unknown as JourneyTypeEnum,
                    name: `CustomFlow${String(i).padStart(2, '0')}`,
                    store_name: 'test-store',
                    store_type: 'shopify',
                    state: JourneyStatusEnum.Active,
                    store_integration_id: 1,
                    created_datetime: '2024-01-01T00:00:00Z',
                    account_id: 1,
                }),
            )

            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            mockUseFlowsList.mockReturnValue({
                data: {
                    built_in: [],
                    custom: customFlows,
                } as FlowsListResponse,
                isLoading: false,
            })

            renderComponent()

            expect(screen.queryByText('CustomFlow10')).not.toBeInTheDocument()
            expect(screen.queryByText('CustomFlow14')).not.toBeInTheDocument()
        })

        it('should call setPageParam with next page when next button is clicked', async () => {
            const user = userEvent.setup()
            const customFlows = Array.from(
                { length: CUSTOM_FLOWS_PAGE_SIZE + 5 },
                (_, i) => ({
                    id: `custom-${i}`,
                    type: 'custom' as unknown as JourneyTypeEnum,
                    name: `Flow ${String(i).padStart(2, '0')}`,
                    store_name: 'test-store',
                    store_type: 'shopify',
                    state: JourneyStatusEnum.Active,
                    store_integration_id: 1,
                    created_datetime: '2024-01-01T00:00:00Z',
                    account_id: 1,
                }),
            )

            mockUseFlowsList.mockReturnValue({
                data: {
                    built_in: [],
                    custom: customFlows,
                } as FlowsListResponse,
                isLoading: false,
            })

            renderComponent()

            const nav = screen.getByRole('navigation', {
                name: /pagination/i,
            })
            const buttons = Array.from(nav.querySelectorAll('button'))
            const nextButton = buttons[buttons.length - 1]

            await user.click(nextButton)

            expect(mockSetPageParam).toHaveBeenCalledWith('2')
        })

        it('should call setPageParam with previous page when previous button is clicked', async () => {
            const user = userEvent.setup()
            mockUseSearchParam.mockReturnValue(['2', mockSetPageParam])

            const customFlows = Array.from(
                { length: CUSTOM_FLOWS_PAGE_SIZE + 5 },
                (_, i) => ({
                    id: `custom-${i}`,
                    type: 'custom' as unknown as JourneyTypeEnum,
                    name: `Flow ${String(i).padStart(2, '0')}`,
                    store_name: 'test-store',
                    store_type: 'shopify',
                    state: JourneyStatusEnum.Active,
                    store_integration_id: 1,
                    created_datetime: '2024-01-01T00:00:00Z',
                    account_id: 1,
                }),
            )

            mockUseFlowsList.mockReturnValue({
                data: {
                    built_in: [],
                    custom: customFlows,
                } as FlowsListResponse,
                isLoading: false,
            })

            renderComponent('?page=2')

            const nav = screen.getByRole('navigation', {
                name: /pagination/i,
            })
            const buttons = Array.from(nav.querySelectorAll('button'))
            const prevButton = buttons[0]

            await user.click(prevButton)

            expect(mockSetPageParam).toHaveBeenCalledWith('1')
        })
    })

    describe('Empty state', () => {
        it('should show empty state message for custom flows when flag is enabled and no custom flows exist', () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiJourneyCustomFlowEnabled)
                    return true
                return true
            })

            mockUseFlowsList.mockReturnValue({
                data: emptyFlowsList,
                isLoading: false,
            })

            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            renderComponent()

            expect(
                screen.getByText(
                    'No custom flows yet. Add one to connect Klaviyo webhooks.',
                ),
            ).toBeInTheDocument()
        })

        it('should not show empty state when custom flow flag is disabled', () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiJourneyCustomFlowEnabled)
                    return false
                return true
            })

            mockUseFlowsList.mockReturnValue({
                data: emptyFlowsList,
                isLoading: false,
            })

            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContextDefaults,
                journeys: [],
            })

            renderComponent()

            expect(
                screen.queryByText(
                    'No custom flows yet. Add one to connect Klaviyo webhooks.',
                ),
            ).not.toBeInTheDocument()
        })
    })

    describe('Metrics display', () => {
        it('should display metrics for configured flows', () => {
            mockUseLocalStorage.mockReturnValue([
                journeyTableDataMetrics,
                jest.fn(),
                jest.fn(),
            ])

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
