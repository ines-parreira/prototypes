import React, { ComponentProps } from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { AgentsCellContent } from 'domains/reporting/pages/support-performance/agents/AgentsCellContent'
import { AgentsHeaderCellContent } from 'domains/reporting/pages/support-performance/agents/AgentsHeaderCellContent'
import { AgentsTableAverageCell } from 'domains/reporting/pages/support-performance/agents/AgentsTableAverageCell'
import { AutoQAAgentsTable } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTable'
import {
    AUTO_QA_AGENTS_TABLE_DIMENSIONS_COLUMNS_ORDER,
    AutoQAAgentsTableColumn,
    getColumnWidth,
    TableLabels,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { getPageStatsFilters } from 'domains/reporting/state/stats/selectors'
import {
    getHeatmapMode,
    getPaginatedAutoQAAgents,
    getSortedAutoQAAgents,
    isSortingMetricLoading,
    pageSet,
} from 'domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice'
import { agents } from 'fixtures/agents'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock(
    'domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice',
    () =>
        ({
            ...jest.requireActual(
                'domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice',
            ),
            getSortedAutoQAAgents: jest.fn(),
            getPaginatedAutoQAAgents: jest.fn(),
            getHeatmapMode: jest.fn(),
            isSortingMetricLoading: jest.fn(),
        }) as Record<string, any>,
)
jest.mock(
    'domains/reporting/state/stats/selectors',
    () =>
        ({
            ...jest.requireActual('domains/reporting/state/stats/selectors'),
            getPageStatsFilters: jest.fn(),
        }) as Record<string, any>,
)
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModalTrigger.tsx',
    () => ({
        DrillDownModalTrigger: ({
            children,
        }: ComponentProps<typeof DrillDownModalTrigger>) => children,
    }),
)
const getSortedAutoQAAgentsMock = assumeMock(getSortedAutoQAAgents)
const getPaginatedAutoQAAgentsMock = assumeMock(getPaginatedAutoQAAgents)
const getPageStatsFiltersMock = assumeMock(getPageStatsFilters)
const getHeatmapModeMock = assumeMock(getHeatmapMode)
const isSortingMetricLoadingMock = assumeMock(isSortingMetricLoading)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentsCellContent',
)
const AgentsCellContentMock = assumeMock(AgentsCellContent)

jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentsHeaderCellContent.tsx',
)
const AgentsHeaderCellContentMock = assumeMock(AgentsHeaderCellContent)

jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentsTableAverageCell.tsx',
)
const AgentsTableSummaryCellMock = assumeMock(AgentsTableAverageCell)

const cellMock = () => <div />

describe('<AutoQAAgentsTable />', () => {
    const currentPage = 2
    const paginatedAgents = agents.slice(1)
    const filters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
    }
    beforeEach(() => {
        getSortedAutoQAAgentsMock.mockReturnValue(agents)
        getPaginatedAutoQAAgentsMock.mockReturnValue({
            agents: paginatedAgents,
            allAgents: agents,
            currentPage,
            perPage: 1,
        })
        getPageStatsFiltersMock.mockReturnValue(filters as any)
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: filters,
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        getHeatmapModeMock.mockReturnValue(false)
        isSortingMetricLoadingMock.mockReturnValue(false)
        AgentsCellContentMock.mockImplementation(cellMock)
        AgentsHeaderCellContentMock.mockImplementation(cellMock)
        AgentsTableSummaryCellMock.mockImplementation(cellMock)
    })

    it('should render the table title, table header and rows', () => {
        render(
            <Provider store={mockStore({})}>
                <AutoQAAgentsTable />
            </Provider>,
        )

        const tableColumns = AUTO_QA_AGENTS_TABLE_DIMENSIONS_COLUMNS_ORDER

        expect(screen.getByRole('table')).toBeInTheDocument()
        tableColumns.forEach((column) => {
            expect(AgentsHeaderCellContentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: TableLabels[column],
                }),
                {},
            )
        })

        expect(AgentsCellContentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                agent: paginatedAgents[0],
            }),
            {},
        )
    })

    it('should handle table scrolling', async () => {
        render(
            <Provider store={mockStore({})}>
                <AutoQAAgentsTable />
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
                <AutoQAAgentsTable />
            </Provider>,
        )
        act(() => {
            const tableRow = document.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, { target: { scrollLeft: 0 } })
        })

        await waitFor(() => {
            expect(screen.getAllByRole('cell')[0]).not.toHaveClass('withShadow')
        })
    })

    describe('Pagination', () => {
        it('should render if there are more agents then perPage', () => {
            render(
                <Provider store={mockStore({})}>
                    <AutoQAAgentsTable />
                </Provider>,
            )

            expect(screen.getByText(currentPage)).toBeInTheDocument()
        })

        it('should not render if less agent then perPage', () => {
            getPaginatedAutoQAAgentsMock.mockReturnValue({
                agents,
                allAgents: agents,
                currentPage: 1,
                perPage: agents.length + 1,
            })

            render(
                <Provider store={mockStore({})}>
                    <AutoQAAgentsTable />
                </Provider>,
            )

            expect(screen.queryByText(currentPage)).not.toBeInTheDocument()
        })

        it('should dispatch pageSet action on click', () => {
            const store = mockStore({})
            const pageToClick = currentPage - 1
            getPaginatedAutoQAAgentsMock.mockReturnValue({
                agents,
                allAgents: agents,
                currentPage,
                perPage: 1,
            })

            render(
                <Provider store={store}>
                    <AutoQAAgentsTable />
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
                expect(
                    getColumnWidth(AutoQAAgentsTableColumn.AgentName),
                ).toEqual(expectedAgentsWidth)
                expect(
                    getColumnWidth(AutoQAAgentsTableColumn.CommunicationSkills),
                ).toEqual(expectedOtherColumnsWidth)
            },
        )
    })
})
