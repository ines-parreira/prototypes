import React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useFlag } from 'core/flags'
import { INTENT_LEVEL } from 'domains/reporting/hooks/automate/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { pageSet } from 'domains/reporting/state/ui/stats/insightsSlice'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import useAppSelector from 'hooks/useAppSelector'
import {
    IntentTable,
    IntentTableWithDefaultState,
    LoadingTableRows,
} from 'pages/aiAgent/insights/IntentTableWidget/IntentTable'
import { TableLabels } from 'pages/aiAgent/insights/IntentTableWidget/IntentTableConfig'
import {
    IntentTableColumn,
    PaginatedIntents,
} from 'pages/aiAgent/insights/IntentTableWidget/types'
import TableBody from 'pages/common/components/table/TableBody'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = jest.mocked(useAppSelector)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
const useAIAgentUserIdMock = assumeMock(
    require('domains/reporting/hooks/automate/useAIAgentUserId')
        .useAIAgentUserId,
)

jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    require('pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData')
        .useGetCustomTicketsFieldsDefinitionData,
)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn(() => ({
        shopType: 'shopify',
        shopName: 'shopName',
    })),
}))
jest.mock('hooks/integrations/useGetTicketChannelsStoreIntegrations')
const getTicketChannelsStoreIntegrationsMock = assumeMock(
    useGetTicketChannelsStoreIntegrations,
)

jest.mock('pages/aiAgent/insights/IntentTableWidget/hooks/useIntentQuery')
const useIntentQueryMock = assumeMock(
    require('pages/aiAgent/insights/IntentTableWidget/hooks/useIntentQuery')
        .useIntentQuery,
)

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

const mockStore = configureMockStore([thunk])
const defaultPaginatedIntents = {
    intents: [
        {
            id: 'order::track',
            [IntentTableColumn.IntentName]: 'order/track',
            [IntentTableColumn.SuccessRateUpliftOpportunity]: 10,
            [IntentTableColumn.AvgCustomerSatisfaction]: 4.5,
        },
        {
            id: 'order::cancel',
            [IntentTableColumn.IntentName]: 'order/cancel',
            [IntentTableColumn.SuccessRateUpliftOpportunity]: 20,
            [IntentTableColumn.AvgCustomerSatisfaction]: 3.8,
        },
    ],
    allIntents: [
        {
            id: 'order::track',
            [IntentTableColumn.IntentName]: 'order/track',
            [IntentTableColumn.SuccessRateUpliftOpportunity]: 10,
            [IntentTableColumn.AvgCustomerSatisfaction]: 4.5,
        },
        {
            id: 'order::cancel',
            [IntentTableColumn.IntentName]: 'order/cancel',
            [IntentTableColumn.SuccessRateUpliftOpportunity]: 20,
            [IntentTableColumn.AvgCustomerSatisfaction]: 3.8,
        },
    ],
    currentPage: 1,
    perPage: 10,
} as unknown as PaginatedIntents
const initialState = {
    ui: {
        stats: {
            insightsSlice: {
                paginatedIntents: defaultPaginatedIntents,
                isSortingLoading: false,
                sorting: {
                    field: IntentTableColumn.SuccessRateUpliftOpportunity,
                    direction: 'desc',
                    isLoading: false,
                },
            },
        },
    },
}

const queryClient = mockQueryClient()

const startDate = '2021-05-01T00:00:00+02:00'
const endDate = '2021-05-04T23:59:59+02:00'
const filters = {
    period: {
        start_datetime: startDate,
        end_datetime: endDate,
    },
}
const userTimezone = 'UTC'
const aiAgentUserId = 'agent-123'
const intentFieldId = 123
const outcomeFieldId = 346

const renderWithProvider = (
    ui: React.ReactElement,
    store: ReturnType<typeof mockStore>,
) =>
    render(
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>{ui}</Provider>
        </QueryClientProvider>,
    )

describe('Intent Table components', () => {
    describe('IntentTable', () => {
        beforeEach(() => {
            useAppSelectorMock.mockReturnValue(false)
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: filters,
                userTimezone,
            } as unknown as ReturnType<typeof useStatsFilters>)

            getTicketChannelsStoreIntegrationsMock.mockReturnValue(['1'])
            useAIAgentUserIdMock.mockReturnValue(undefined)
            useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
                intentCustomFieldId: null,
                outcomeCustomFieldId: null,
            })
            useIntentQueryMock.mockReturnValue({
                data: [
                    {
                        id: 'order::track::details',
                        [IntentTableColumn.IntentName]: 'order/track/details',
                        [IntentTableColumn.SuccessRateUpliftOpportunity]: 5,
                        [IntentTableColumn.AvgCustomerSatisfaction]: 4.2,
                    },
                ],
                isLoading: false,
            })
        })
        it('renders table with data', () => {
            const store = mockStore(initialState)
            renderWithProvider(
                <IntentTable
                    paginatedIntents={defaultPaginatedIntents}
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            expect(
                screen.getByText(TableLabels[IntentTableColumn.IntentName]),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    TableLabels[IntentTableColumn.SuccessRateUpliftOpportunity],
                ),
            ).toBeInTheDocument()

            expect(screen.getByText('order/track')).toBeInTheDocument()
            expect(screen.getByText('order/cancel')).toBeInTheDocument()
        })

        it('handles pagination correctly', () => {
            const paginatedIntents = {
                ...defaultPaginatedIntents,
                perPage: 1,
            }
            const store = mockStore({
                ...initialState,
                ui: {
                    stats: {
                        insightsSlice: { paginatedIntents: paginatedIntents },
                    },
                },
            })

            renderWithProvider(
                <IntentTable
                    paginatedIntents={paginatedIntents}
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            fireEvent.click(screen.getByText('2'))

            const actions = store.getActions()
            expect(actions).toContainEqual(pageSet(2)) // Ensure pageSet action is dispatched
        })

        it('do not show pagination when data can fit in one page', () => {
            const paginatedIntents = {
                ...defaultPaginatedIntents,
                perPage: 10,
            }
            const store = mockStore({
                ...initialState,
                ui: {
                    stats: {
                        insightsSlice: { paginatedIntents: paginatedIntents },
                    },
                },
            })

            renderWithProvider(
                <IntentTable
                    paginatedIntents={paginatedIntents}
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            expect(screen.queryByText('1')).toBeNull()
            expect(screen.getByText('Intent')).toBeInTheDocument()
        })

        it('do not show pagination when total equals perPage', () => {
            const paginatedIntents = {
                ...defaultPaginatedIntents,
                perPage: 2,
            }
            const store = mockStore({
                ...initialState,
                ui: {
                    stats: {
                        insightsSlice: { paginatedIntents: paginatedIntents },
                    },
                },
            })

            renderWithProvider(
                <IntentTable
                    paginatedIntents={paginatedIntents}
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            expect(screen.queryByText('1')).toBeNull()
            expect(screen.getByText('Intent')).toBeInTheDocument()
        })

        it('do not show customer satisfaction drilldown when agentId is not present', () => {
            const store = mockStore({
                ...initialState,
                ui: {
                    stats: {
                        insightsSlice: {
                            paginatedIntents: defaultPaginatedIntents,
                        },
                    },
                },
            })

            useAIAgentUserIdMock.mockReturnValue(undefined)
            renderWithProvider(
                <IntentTable
                    paginatedIntents={defaultPaginatedIntents}
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            // Find all cells in the AvgCustomerSatisfaction column
            const csatCells = screen
                .getAllByRole('cell')
                .filter(
                    (cell) =>
                        cell.textContent === '4.6' || cell.textContent === '-',
                )

            // Verify that none of the cells have drilldown functionality by checking for the DrillDownModalTrigger's span element
            csatCells.forEach((cell) => {
                const drillDownTrigger = cell.querySelector(
                    'span[class*="text"]',
                )
                expect(drillDownTrigger).toBeNull()
            })
        })

        it('show customer satisfaction drilldown when all required values are present', () => {
            const store = mockStore({
                ...initialState,
                ui: {
                    stats: {
                        insightsSlice: {
                            paginatedIntents: defaultPaginatedIntents,
                        },
                    },
                },
            })

            // Set up all required values
            useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
            useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
                intentCustomFieldId: intentFieldId,
                outcomeCustomFieldId: outcomeFieldId,
            })

            renderWithProvider(
                <IntentTable
                    paginatedIntents={defaultPaginatedIntents}
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            // Find all cells in the AvgCustomerSatisfaction column
            const csatCells = screen
                .getAllByRole('cell')
                .filter(
                    (cell) =>
                        cell.textContent === '4.6' ||
                        cell.textContent === '3.8',
                )

            // Verify that all cells have drilldown functionality by checking for the DrillDownModalTrigger's span element
            csatCells.forEach((cell) => {
                const drillDownTrigger = cell.querySelector(
                    'span[class*="text"]',
                )
                expect(drillDownTrigger).not.toBeNull()
                expect(drillDownTrigger).toHaveClass('highlighted')
            })
        })

        it('should expand intent children when parent intent is clicked', () => {
            useFlagMock.mockReturnValue(true)

            const store = mockStore(initialState)

            renderWithProvider(
                <IntentTable
                    paginatedIntents={defaultPaginatedIntents}
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            const expandIcons = screen.getAllByText('arrow_right')
            fireEvent.click(expandIcons[0])

            expect(screen.getByText('order/track/details')).toBeInTheDocument()
        })

        it('adds and removes header shadow on horizontal scroll', () => {
            const store = mockStore(initialState)

            const { container } = renderWithProvider(
                <IntentTable
                    paginatedIntents={defaultPaginatedIntents}
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            const tableWrapper = container.querySelector(
                '.tableWrapper',
            ) as HTMLDivElement
            expect(tableWrapper).toBeTruthy()
            const scrollContainer = tableWrapper.parentElement as HTMLDivElement
            expect(scrollContainer).toBeTruthy()

            const headerEl = screen.getByText(
                TableLabels[IntentTableColumn.IntentName],
            ) as HTMLElement

            const hasWithShadow = (el: HTMLElement) => {
                let node: HTMLElement | null = el
                while (node) {
                    if (
                        typeof (node as HTMLElement).className === 'string' &&
                        (node as HTMLElement).className.includes('withShadow')
                    ) {
                        return true
                    }
                    node = node.parentElement
                }
                return false
            }

            expect(hasWithShadow(headerEl)).toBe(false)

            // Scroll right: should add shadow on first header cell
            scrollContainer.scrollLeft = 50
            fireEvent.scroll(scrollContainer)
            expect(hasWithShadow(headerEl)).toBe(true)

            // Scroll back to start: should remove shadow
            scrollContainer.scrollLeft = 0
            fireEvent.scroll(scrollContainer)
            expect(hasWithShadow(headerEl)).toBe(false)
        })

        it('renders children skeleton with child-width path when loading after expand', () => {
            // Force children loading state
            useIntentQueryMock.mockReturnValue({ data: [], isLoading: true })

            // Mock widths so we can assert which path is used
            const configModule = require('pages/aiAgent/insights/IntentTableWidget/IntentTableConfig')
            const childWidthSpy = jest
                .spyOn(configModule, 'getChildrenSkeletonColumnWidth')
                .mockReturnValue(200)
            const parentWidthSpy = jest
                .spyOn(configModule, 'getColumnWidth')
                .mockReturnValue(100)

            const store = mockStore(initialState)

            const { container } = renderWithProvider(
                <IntentTable
                    paginatedIntents={defaultPaginatedIntents}
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            // Expand first row to trigger lazy load skeleton (intentLevel + 1 branch)
            const expandIcons = screen.getAllByText('arrow_right')
            expect(expandIcons.length).toBeGreaterThan(0)
            fireEvent.click(expandIcons[0])

            const skeleton = container.querySelector(
                '.skeletonWrapper',
            ) as HTMLDivElement
            expect(skeleton).toBeTruthy()
            // Skeleton width should be childWidth - 36 = 164px when using children path
            expect(skeleton.getAttribute('style') || '').toMatch(
                /width:\s*164px/i,
            )

            parentWidthSpy.mockRestore()
            childWidthSpy.mockRestore()
        })
    })
    describe('LoadingTableRows', () => {
        it('renders correct number of loading rows', async () => {
            render(
                <MemoryRouter>
                    <TableWrapper>
                        <TableBody>
                            <LoadingTableRows />
                        </TableBody>
                    </TableWrapper>
                </MemoryRouter>,
            )
            const rows = await screen.findAllByRole('cell', { hidden: true })
            expect(rows.length).toBe(4 * Object.keys(IntentTableColumn).length) // For rows with 6 columns
        })
    })
    describe('IntentTableWithDefaultState', () => {
        it('renders no data message when there are no intents', () => {
            const noDataState = {
                ...initialState,
                ui: {
                    stats: {
                        insightsSlice: {
                            ...initialState.ui.stats.insightsSlice,
                            paginatedIntents: {
                                intents: [],
                                allIntents: [],
                                currentPage: 1,
                                perPage: 10,
                            },
                            sorting: {
                                field: IntentTableColumn.SuccessRateUpliftOpportunity,
                                direction: 'desc',
                                isLoading: false,
                            },
                        },
                    },
                },
            }
            const store = mockStore(noDataState)
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: filters,
                userTimezone,
            } as unknown as ReturnType<typeof useStatsFilters>)

            renderWithProvider(
                <IntentTableWithDefaultState
                    tableTitle="Test Table"
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            expect(screen.getByText('No data available')).toBeInTheDocument()
            expect(
                screen.getByText('Try adjusting filters to get results.'),
            ).toBeInTheDocument()
        })

        it('renders table without pagination when intents can fit in one page', () => {
            const paginatedIntents = {
                ...defaultPaginatedIntents,
                perPage: 10,
            }

            useAppSelectorMock.mockReturnValue(paginatedIntents)
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: filters,
                userTimezone,
            } as unknown as ReturnType<typeof useStatsFilters>)
            const store = mockStore({
                ...initialState,
                ui: {
                    stats: {
                        insightsSlice: {
                            paginatedIntents: paginatedIntents,
                            isSortingLoading: false,
                            sorting: {
                                field: IntentTableColumn.SuccessRateUpliftOpportunity,
                                direction: 'desc',
                                isLoading: false,
                            },
                        },
                    },
                },
            })

            renderWithProvider(
                <IntentTableWithDefaultState
                    tableTitle="Test Table"
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            expect(screen.queryByText('1')).toBeNull()
            expect(screen.getByText('Intent')).toBeInTheDocument()
        })

        it('renders table with description', () => {
            const paginatedIntents = {
                ...defaultPaginatedIntents,
                perPage: 10,
            }

            useAppSelectorMock.mockReturnValue(paginatedIntents)
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: filters,
                userTimezone,
            } as unknown as ReturnType<typeof useStatsFilters>)
            const store = mockStore({
                ...initialState,
                ui: {
                    stats: {
                        insightsSlice: {
                            paginatedIntents: paginatedIntents,
                            isSortingLoading: false,
                            sorting: {
                                field: IntentTableColumn.SuccessRateUpliftOpportunity,
                                direction: 'desc',
                                isLoading: false,
                            },
                        },
                    },
                },
            })

            renderWithProvider(
                <IntentTableWithDefaultState
                    tableTitle="Test Table"
                    tableDescription="Test Description"
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            expect(screen.getByText('Test Description')).toBeInTheDocument()
        })

        it('renders table without description when tableDescription is not valid', () => {
            const paginatedIntents = {
                ...defaultPaginatedIntents,
                perPage: 10,
            }

            useAppSelectorMock.mockReturnValue(paginatedIntents)
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: filters,
                userTimezone,
            } as unknown as ReturnType<typeof useStatsFilters>)
            const store = mockStore({
                ...initialState,
                ui: {
                    stats: {
                        insightsSlice: {
                            paginatedIntents: paginatedIntents,
                            isSortingLoading: false,
                            sorting: {
                                field: IntentTableColumn.SuccessRateUpliftOpportunity,
                                direction: 'desc',
                                isLoading: false,
                            },
                        },
                    },
                },
            })

            renderWithProvider(
                <IntentTableWithDefaultState
                    tableTitle="Test Table"
                    tableDescription={
                        (<div>Test Description</div>) as unknown as string
                    }
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            expect(
                screen.queryByText('Test Description'),
            ).not.toBeInTheDocument()
        })

        it('applies chartContainerNoPagination class when all intents fit in one page', () => {
            const paginatedIntents = {
                ...defaultPaginatedIntents,
                allIntents: [
                    {
                        id: 'order::track',
                        [IntentTableColumn.IntentName]: 'order/track',
                        [IntentTableColumn.SuccessRateUpliftOpportunity]: 10,
                        [IntentTableColumn.AvgCustomerSatisfaction]: 4.5,
                    },
                    {
                        id: 'order::cancel',
                        [IntentTableColumn.IntentName]: 'order/cancel',
                        [IntentTableColumn.SuccessRateUpliftOpportunity]: 20,
                        [IntentTableColumn.AvgCustomerSatisfaction]: 3.8,
                    },
                ],
                intents: [
                    {
                        id: 'order::track',
                        [IntentTableColumn.IntentName]: 'order/track',
                        [IntentTableColumn.SuccessRateUpliftOpportunity]: 10,
                        [IntentTableColumn.AvgCustomerSatisfaction]: 4.5,
                    },
                    {
                        id: 'order::cancel',
                        [IntentTableColumn.IntentName]: 'order/cancel',
                        [IntentTableColumn.SuccessRateUpliftOpportunity]: 20,
                        [IntentTableColumn.AvgCustomerSatisfaction]: 3.8,
                    },
                ],
                perPage: 10,
            } as unknown as PaginatedIntents

            useAppSelectorMock.mockReturnValue(paginatedIntents)
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: filters,
                userTimezone,
            } as unknown as ReturnType<typeof useStatsFilters>)
            const store = mockStore({
                ...initialState,
                ui: {
                    stats: {
                        insightsSlice: {
                            paginatedIntents: paginatedIntents,
                            isSortingLoading: false,
                            sorting: {
                                field: IntentTableColumn.SuccessRateUpliftOpportunity,
                                direction: 'desc',
                                isLoading: false,
                            },
                        },
                    },
                },
            })

            const { container } = renderWithProvider(
                <IntentTableWithDefaultState
                    tableTitle="Test Table"
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            const divs = container.querySelectorAll('div')
            let chartContainer: HTMLDivElement | null = null
            divs.forEach((div) => {
                if (div.className && div.className.includes('chartContainer')) {
                    chartContainer = div as HTMLDivElement
                }
            })

            expect(chartContainer).toBeTruthy()
            expect(chartContainer!.className).toMatch(/chartContainer/)
            expect(chartContainer!.className).toMatch(
                /chartContainerNoPagination/,
            )
        })

        it('does not apply chartContainerNoPagination class when pagination is needed', () => {
            const paginatedIntents = {
                ...defaultPaginatedIntents,
                allIntents: [
                    {
                        id: 'order::track',
                        [IntentTableColumn.IntentName]: 'order/track',
                        [IntentTableColumn.SuccessRateUpliftOpportunity]: 10,
                        [IntentTableColumn.AvgCustomerSatisfaction]: 4.5,
                    },
                    {
                        id: 'order::cancel',
                        [IntentTableColumn.IntentName]: 'order/cancel',
                        [IntentTableColumn.SuccessRateUpliftOpportunity]: 20,
                        [IntentTableColumn.AvgCustomerSatisfaction]: 3.8,
                    },
                    {
                        id: 'order::return',
                        [IntentTableColumn.IntentName]: 'order/return',
                        [IntentTableColumn.SuccessRateUpliftOpportunity]: 15,
                        [IntentTableColumn.AvgCustomerSatisfaction]: 4.0,
                    },
                ],
                intents: [
                    {
                        id: 'order::track',
                        [IntentTableColumn.IntentName]: 'order/track',
                        [IntentTableColumn.SuccessRateUpliftOpportunity]: 10,
                        [IntentTableColumn.AvgCustomerSatisfaction]: 4.5,
                    },
                    {
                        id: 'order::cancel',
                        [IntentTableColumn.IntentName]: 'order/cancel',
                        [IntentTableColumn.SuccessRateUpliftOpportunity]: 20,
                        [IntentTableColumn.AvgCustomerSatisfaction]: 3.8,
                    },
                ],
                perPage: 2,
            } as unknown as PaginatedIntents

            useAppSelectorMock.mockReturnValue(paginatedIntents)
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: filters,
                userTimezone,
            } as unknown as ReturnType<typeof useStatsFilters>)
            const store = mockStore({
                ...initialState,
                ui: {
                    stats: {
                        insightsSlice: {
                            paginatedIntents: paginatedIntents,
                            isSortingLoading: false,
                            sorting: {
                                field: IntentTableColumn.SuccessRateUpliftOpportunity,
                                direction: 'desc',
                                isLoading: false,
                            },
                        },
                    },
                },
            })

            const { container } = renderWithProvider(
                <IntentTableWithDefaultState
                    tableTitle="Test Table"
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            const divs = container.querySelectorAll('div')
            let chartContainer: HTMLDivElement | null = null
            divs.forEach((div) => {
                if (div.className && div.className.includes('chartContainer')) {
                    chartContainer = div as HTMLDivElement
                }
            })

            expect(chartContainer).toBeTruthy()
            expect(chartContainer!.className).toMatch(/chartContainer/)
            expect(chartContainer!.className).not.toMatch(
                /chartContainerNoPagination/,
            )
        })

        it('does not apply chartContainerNoPagination class when paginatedIntents is null', () => {
            useAppSelectorMock.mockReturnValue(null)
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: filters,
                userTimezone,
            } as unknown as ReturnType<typeof useStatsFilters>)
            const store = mockStore({
                ...initialState,
                ui: {
                    stats: {
                        insightsSlice: {
                            paginatedIntents: null,
                            isSortingLoading: false,
                            sorting: {
                                field: IntentTableColumn.SuccessRateUpliftOpportunity,
                                direction: 'desc',
                                isLoading: false,
                            },
                        },
                    },
                },
            })

            const { container } = renderWithProvider(
                <IntentTableWithDefaultState
                    tableTitle="Test Table"
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            const divs = container.querySelectorAll('div')
            let chartContainer: HTMLDivElement | null = null
            divs.forEach((div) => {
                if (div.className && div.className.includes('chartContainer')) {
                    chartContainer = div as HTMLDivElement
                }
            })

            expect(chartContainer).toBeTruthy()
            expect(chartContainer!.className).toMatch(/chartContainer/)
            expect(chartContainer!.className).not.toMatch(
                /chartContainerNoPagination/,
            )
        })

        it('applies chartContainerNoPagination class when intents length equals perPage', () => {
            const paginatedIntents = {
                ...defaultPaginatedIntents,
                allIntents: [
                    {
                        id: 'order::track',
                        [IntentTableColumn.IntentName]: 'order/track',
                        [IntentTableColumn.SuccessRateUpliftOpportunity]: 10,
                        [IntentTableColumn.AvgCustomerSatisfaction]: 4.5,
                    },
                    {
                        id: 'order::cancel',
                        [IntentTableColumn.IntentName]: 'order/cancel',
                        [IntentTableColumn.SuccessRateUpliftOpportunity]: 20,
                        [IntentTableColumn.AvgCustomerSatisfaction]: 3.8,
                    },
                ],
                intents: [
                    {
                        id: 'order::track',
                        [IntentTableColumn.IntentName]: 'order/track',
                        [IntentTableColumn.SuccessRateUpliftOpportunity]: 10,
                        [IntentTableColumn.AvgCustomerSatisfaction]: 4.5,
                    },
                    {
                        id: 'order::cancel',
                        [IntentTableColumn.IntentName]: 'order/cancel',
                        [IntentTableColumn.SuccessRateUpliftOpportunity]: 20,
                        [IntentTableColumn.AvgCustomerSatisfaction]: 3.8,
                    },
                ],
                perPage: 2,
            } as unknown as PaginatedIntents

            useAppSelectorMock.mockReturnValue(paginatedIntents)
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: filters,
                userTimezone,
            } as unknown as ReturnType<typeof useStatsFilters>)
            const store = mockStore({
                ...initialState,
                ui: {
                    stats: {
                        insightsSlice: {
                            paginatedIntents: paginatedIntents,
                            isSortingLoading: false,
                            sorting: {
                                field: IntentTableColumn.SuccessRateUpliftOpportunity,
                                direction: 'desc',
                                isLoading: false,
                            },
                        },
                    },
                },
            })

            const { container } = renderWithProvider(
                <IntentTableWithDefaultState
                    tableTitle="Test Table"
                    intentLevel={INTENT_LEVEL}
                />,
                store,
            )

            const divs = container.querySelectorAll('div')
            let chartContainer: HTMLDivElement | null = null
            divs.forEach((div) => {
                if (div.className && div.className.includes('chartContainer')) {
                    chartContainer = div as HTMLDivElement
                }
            })

            expect(chartContainer).toBeTruthy()
            expect(chartContainer!.className).toMatch(/chartContainer/)
            expect(chartContainer!.className).toMatch(
                /chartContainerNoPagination/,
            )

            // Also verify no pagination numbers are rendered
            expect(screen.queryByText('1')).toBeNull()
        })
    })
})
