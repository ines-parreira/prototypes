import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {MemoryRouter} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import thunk from 'redux-thunk'

import useAppSelector from 'hooks/useAppSelector'
import TableBody from 'pages/common/components/table/TableBody'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {pageSet} from 'state/ui/stats/insightsSlice'

import {
    IntentTable,
    LoadingTableRows,
    IntentTableWithDefaultState,
} from '../IntentTable'

import {TableLabels} from '../IntentTableConfig'
import {IntentTableColumn, PaginatedIntents} from '../types'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = jest.mocked(useAppSelector)

const mockStore = configureMockStore([thunk])
const defaultPaginatedIntents = {
    intents: [
        {
            id: 1,
            intent_name: 'order/track',
            automation_opportunities: 10,
        },
        {
            id: 2,
            intent_name: 'order/cancel',
            automation_opportunities: 20,
        },
    ],
    allIntents: [
        {
            id: 1,
            intent_name: 'order/track',
            automation_opportunities: 10,
        },
        {
            id: 2,
            intent_name: 'order/cancel',
            automation_opportunities: 20,
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
            },
        },
    },
}

const renderWithProvider = (
    ui: React.ReactElement,
    store: ReturnType<typeof mockStore>
) => render(<Provider store={store}>{ui}</Provider>)

describe('Intent Table components', () => {
    describe('IntentTable', () => {
        beforeEach(() => {
            useAppSelectorMock.mockReturnValue(false)
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
    })
})
