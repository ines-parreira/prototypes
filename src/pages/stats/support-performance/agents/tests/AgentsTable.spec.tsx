import React, { ComponentProps } from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { agents } from 'fixtures/agents'
import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import { ReportingGranularity } from 'models/reporting/types'
import { DrillDownModalTrigger } from 'pages/stats/DrillDownModalTrigger'
import { AgentsCellContent } from 'pages/stats/support-performance/agents/AgentsCellContent'
import { AgentsHeaderCellContent } from 'pages/stats/support-performance/agents/AgentsHeaderCellContent'
import {
    AgentsTable,
    AgentsTableWithDefaultState,
} from 'pages/stats/support-performance/agents/AgentsTable'
import {
    getColumnWidth,
    TableColumnsOrder,
    TableLabels,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { AgentsTableSummaryCell } from 'pages/stats/support-performance/agents/AgentsTableSummaryCell'
import { RootState, StoreDispatch } from 'state/types'
import {
    getHeatmapMode,
    getPaginatedAgents,
    getSortedAgents,
    isSortingMetricLoading,
    pageSet,
} from 'state/ui/stats/agentPerformanceSlice'
import { AgentsTableColumn } from 'state/ui/stats/types'
import { assumeMock, renderWithStore } from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock(
    'state/ui/stats/agentPerformanceSlice',
    () =>
        ({
            ...jest.requireActual('state/ui/stats/agentPerformanceSlice'),
            getSortedAgents: jest.fn(),
            getPaginatedAgents: jest.fn(),
            isSortingMetricLoading: jest.fn(),
            getHeatmapMode: jest.fn(),
        }) as Record<string, any>,
)
jest.mock(
    'state/stats/selectors',
    () =>
        ({
            ...jest.requireActual('state/stats/selectors'),
            getPageStatsFilters: jest.fn(),
        }) as Record<string, any>,
)
jest.mock('pages/stats/DrillDownModalTrigger.tsx', () => ({
    DrillDownModalTrigger: ({
        children,
    }: ComponentProps<typeof DrillDownModalTrigger>) => children,
}))
const getSortedAgentsMock = assumeMock(getSortedAgents)
const getPaginatedAgentsMock = assumeMock(getPaginatedAgents)
const isSortingMetricLoadingMock = assumeMock(isSortingMetricLoading)
const getHeatmapModeMock = assumeMock(getHeatmapMode)

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

jest.mock('pages/stats/support-performance/agents/AgentsCellContent')
const AgentsCellContentMock = assumeMock(AgentsCellContent)

jest.mock('pages/stats/support-performance/agents/AgentsHeaderCellContent.tsx')
const AgentsHeaderCellContentMock = assumeMock(AgentsHeaderCellContent)

jest.mock('pages/stats/support-performance/agents/AgentsTableSummaryCell.tsx')
const AgentsTableSummaryCellMock = assumeMock(AgentsTableSummaryCell)

const cellMock = () => <div />

describe('<AgentsTable>', () => {
    const currentPage = 2
    getSortedAgentsMock.mockReturnValue(agents)
    const filteredAgents = agents.slice(1)
    const paginatedAgents = {
        agents: filteredAgents,
        allAgents: agents,
        currentPage,
        perPage: 1,
    }
    const statsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
    }
    const statsFiltersWithTimeZone = {
        cleanStatsFilters: statsFilters,
        userTimezone: 'UTC',
        isAnalyticsNewFilters: false,
        granularity: ReportingGranularity.Day,
    }
    isSortingMetricLoadingMock.mockReturnValue(false)
    getHeatmapModeMock.mockReturnValue(false)
    AgentsCellContentMock.mockImplementation(cellMock)
    AgentsHeaderCellContentMock.mockImplementation(cellMock)
    AgentsTableSummaryCellMock.mockImplementation(cellMock)

    describe('AgentsTable component', () => {
        it('should render the table title, table header and rows', () => {
            render(
                <Provider store={mockStore({})}>
                    <AgentsTable
                        paginatedAgents={paginatedAgents}
                        statsFilters={statsFiltersWithTimeZone}
                    />
                </Provider>,
            )

            expect(screen.getByRole('table')).toBeInTheDocument()
            TableColumnsOrder.forEach((column) => {
                expect(AgentsHeaderCellContentMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        title: TableLabels[column],
                    }),
                    {},
                )
            })

            expect(AgentsCellContentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    agent: filteredAgents[0],
                }),
                {},
            )
        })

        it('should handle table scrolling', async () => {
            render(
                <Provider store={mockStore({})}>
                    <AgentsTable
                        paginatedAgents={paginatedAgents}
                        statsFilters={statsFiltersWithTimeZone}
                    />
                </Provider>,
            )
            act(() => {
                const tableRow = document.getElementsByClassName('container')[0]
                fireEvent.scroll(tableRow, { target: { scrollLeft: 50 } })
            })

            await waitFor(() => {
                expect(screen.getAllByRole('cell')[0]).toHaveClass('withShadow')
            })
        })

        it('should handle table scrolling to the left border', async () => {
            render(
                <Provider store={mockStore({})}>
                    <AgentsTable
                        paginatedAgents={paginatedAgents}
                        statsFilters={statsFiltersWithTimeZone}
                    />
                </Provider>,
            )
            act(() => {
                const tableRow = document.getElementsByClassName('container')[0]
                fireEvent.scroll(tableRow, { target: { scrollLeft: 0 } })
            })

            await waitFor(() => {
                expect(screen.getAllByRole('cell')[0]).not.toHaveClass(
                    'withShadow',
                )
            })
        })
    })

    describe('Pagination', () => {
        it('should render if there are more agents then perPage', () => {
            render(
                <Provider store={mockStore({})}>
                    <AgentsTable
                        paginatedAgents={paginatedAgents}
                        statsFilters={statsFiltersWithTimeZone}
                    />
                </Provider>,
            )

            expect(screen.getByText(currentPage)).toBeInTheDocument()
        })

        it('should not render if less agent then perPage', () => {
            const notManyPaginatedAgentsMock = {
                agents,
                allAgents: agents,
                currentPage: 1,
                perPage: agents.length + 1,
            }

            render(
                <Provider store={mockStore({})}>
                    <AgentsTable
                        paginatedAgents={notManyPaginatedAgentsMock}
                        statsFilters={statsFiltersWithTimeZone}
                    />
                </Provider>,
            )

            expect(screen.queryByText(currentPage)).not.toBeInTheDocument()
        })

        it('should dispatch pageSet action on click', () => {
            const store = mockStore({})
            const pageToClick = currentPage - 1
            getPaginatedAgentsMock.mockReturnValue({
                agents,
                allAgents: agents,
                currentPage,
                perPage: 1,
            })

            render(
                <Provider store={store}>
                    <AgentsTable
                        paginatedAgents={paginatedAgents}
                        statsFilters={statsFiltersWithTimeZone}
                    />
                </Provider>,
            )
            act(() => {
                const pageButton = screen.getByText(pageToClick)
                userEvent.click(pageButton)
            })

            expect(store.getActions()).toContainEqual(pageSet(pageToClick))
        })
    })

    describe('getColumnWidth', () => {
        it.each([
            {
                screenResolution: 1200,
                expectedAgentsWidth: 160,
                expectedOtherColumnsWidth: 160,
            },
            {
                screenResolution: 700,
                expectedAgentsWidth: 140,
                expectedOtherColumnsWidth: 120,
            },
        ])(
            'should return correct width',
            ({
                screenResolution,
                expectedAgentsWidth,
                expectedOtherColumnsWidth,
            }) => {
                global.innerWidth = screenResolution
                expect(getColumnWidth(AgentsTableColumn.AgentName)).toEqual(
                    expectedAgentsWidth,
                )
                expect(
                    getColumnWidth(AgentsTableColumn.CustomerSatisfaction),
                ).toEqual(expectedOtherColumnsWidth)
            },
        )
    })

    describe('AgentsTableWithDefaultState', () => {
        const filteredAgents = agents.slice(1)
        beforeEach(() => {
            useNewStatsFiltersMock.mockReturnValue(
                statsFiltersWithTimeZone as any,
            )
            getPaginatedAgentsMock.mockReturnValue({
                agents: filteredAgents,
                allAgents: agents,
                currentPage: 1,
                perPage: 1,
            })
        })

        it('should pass getPaginatedAgents selector and new statsFilters to the AgentsTable component', () => {
            renderWithStore(<AgentsTableWithDefaultState />, {})

            expect(getPaginatedAgentsMock).toHaveBeenCalled()
        })
    })
})
