import {QueryClientProvider} from '@tanstack/react-query'
import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {MemoryRouter} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import thunk from 'redux-thunk'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import {
    IntentTable,
    LoadingTableRows,
    IntentTableWithDefaultState,
} from 'pages/aiAgent/insights/IntentTableWidget/IntentTable'
import {TableLabels} from 'pages/aiAgent/insights/IntentTableWidget/IntentTableConfig'
import {
    IntentTableColumn,
    PaginatedIntents,
} from 'pages/aiAgent/insights/IntentTableWidget/types'
import TableBody from 'pages/common/components/table/TableBody'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {pageSet} from 'state/ui/stats/insightsSlice'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {assumeMock} from 'utils/testing'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = jest.mocked(useAppSelector)

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

const mockStore = configureMockStore([thunk])
const defaultPaginatedIntents = {
    intents: [
        {
            id: 1,
            [IntentTableColumn.IntentName]: 'order/track',
            [IntentTableColumn.AutomationOpportunities]: 10,
        },
        {
            id: 2,
            [IntentTableColumn.IntentName]: 'order/cancel',
            [IntentTableColumn.AutomationOpportunities]: 20,
        },
    ],
    allIntents: [
        {
            id: 1,
            [IntentTableColumn.IntentName]: 'order/track',
            [IntentTableColumn.AutomationOpportunities]: 10,
        },
        {
            id: 2,
            [IntentTableColumn.IntentName]: 'order/cancel',
            [IntentTableColumn.AutomationOpportunities]: 20,
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
                    field: IntentTableColumn.AutomationOpportunities,
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

const renderWithProvider = (
    ui: React.ReactElement,
    store: ReturnType<typeof mockStore>
) =>
    render(
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>{ui}</Provider>
        </QueryClientProvider>
    )

describe('Intent Table components', () => {
    describe('IntentTable', () => {
        beforeEach(() => {
            useAppSelectorMock.mockReturnValue(false)
            useNewStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: filters,
                userTimezone,
            } as unknown as ReturnType<typeof useNewStatsFilters>)
        })
        it('renders table with data', () => {
            const store = mockStore(initialState)
            renderWithProvider(
                <IntentTable paginatedIntents={defaultPaginatedIntents} />,
                store
            )

            expect(
                screen.getByText(TableLabels[IntentTableColumn.IntentName])
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    TableLabels[IntentTableColumn.AutomationOpportunities]
                )
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
                        insightsSlice: {paginatedIntents: paginatedIntents},
                    },
                },
            })

            renderWithProvider(
                <IntentTable paginatedIntents={paginatedIntents} />,
                store
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
                        insightsSlice: {paginatedIntents: paginatedIntents},
                    },
                },
            })

            renderWithProvider(
                <IntentTable paginatedIntents={paginatedIntents} />,
                store
            )

            expect(screen.queryByText('1')).toBeNull()
            expect(screen.getByText('Intent')).toBeInTheDocument()
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
                </MemoryRouter>
            )
            const rows = await screen.findAllByRole('cell', {hidden: true})
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
                        },
                    },
                },
            }
            const store = mockStore(noDataState)

            renderWithProvider(
                <IntentTableWithDefaultState tableTitle="Test Table" />,
                store
            )

            expect(screen.getByText('No data available')).toBeInTheDocument()
            expect(
                screen.getByText('Try adjusting filters to get results.')
            ).toBeInTheDocument()
        })

        it('renders table without pagination when intents can fit in one page', () => {
            const paginatedIntents = {
                ...defaultPaginatedIntents,
                perPage: 10,
            }

            useAppSelectorMock.mockReturnValue(paginatedIntents)
            useNewStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: filters,
                userTimezone,
            } as unknown as ReturnType<typeof useNewStatsFilters>)
            const store = mockStore({
                ...initialState,
                ui: {
                    stats: {
                        insightsSlice: {
                            paginatedIntents: paginatedIntents,
                            isSortingLoading: false,
                            sorting: {
                                field: IntentTableColumn.AutomationOpportunities,
                                direction: 'desc',
                                isLoading: false,
                            },
                        },
                    },
                },
            })

            renderWithProvider(
                <IntentTableWithDefaultState tableTitle="Test Table" />,
                store
            )

            expect(screen.queryByText('1')).toBeNull()
            expect(screen.getByText('Intent')).toBeInTheDocument
        })
    })
})
