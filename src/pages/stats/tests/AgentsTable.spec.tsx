import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LD from 'launchdarkly-react-client-sdk'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {TicketsRepliedPerHourCellContent} from 'pages/stats/TicketsRepliedPerHourCellContent'
import {ClosedTicketsPerHourCellContent} from 'pages/stats/ClosedTicketsPerHourCellContent'
import {MessagesSentPerHourCellContent} from 'pages/stats/MessagesSentPerHourCellContent'
import {FeatureFlagKey} from 'config/featureFlags'
import {agents} from 'fixtures/agents'
import {AgentsHeaderCellContent} from 'pages/stats/AgentsHeaderCellContent'
import {AgentsTable} from 'pages/stats/AgentsTable'
import {TableColumnsOrderWithOnlineTime} from 'pages/stats/AgentsTableConfig'
import {AgentsTableSummaryCell} from 'pages/stats/AgentsTableSummaryCell'
import {ClosedTicketsCellContent} from 'pages/stats/ClosedTicketsCellContent'
import {CustomerSatisfactionCellContent} from 'pages/stats/CustomerSatisfactionCellContent'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import {MedianFirstResponseTimeCellContent} from 'pages/stats/MedianFirstResponseTimeCellContent'
import {MedianResolutionTimeCellContent} from 'pages/stats/MedianResolutionTimeCellContent'
import {MessagesSentCellContent} from 'pages/stats/MessagesSentCellContent'
import {OneTouchTicketsCellContent} from 'pages/stats/OneTouchTicketsCellContent'
import {OnlineTimeCellContent} from 'pages/stats/OnlineTimeCellContent'
import {PercentageOfClosedTicketsCellContent} from 'pages/stats/PercentageOfClosedTicketsCellContent'
import {TicketsRepliedCellContent} from 'pages/stats/TicketsRepliedCellContent'
import {getPageStatsFilters} from 'state/stats/selectors'
import {RootState, StoreDispatch} from 'state/types'
import {
    getPaginatedAgents,
    getSortedAgents,
    pageSet,
} from 'state/ui/stats/agentPerformanceSlice'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock(
    'state/ui/stats/agentPerformanceSlice',
    () =>
        ({
            ...jest.requireActual('state/ui/stats/agentPerformanceSlice'),
            getSortedAgents: jest.fn(),
            getPaginatedAgents: jest.fn(),
        } as Record<string, any>)
)
jest.mock(
    'state/stats/selectors',
    () =>
        ({
            ...jest.requireActual('state/stats/selectors'),
            getPageStatsFilters: jest.fn(),
        } as Record<string, any>)
)
jest.mock('pages/stats/DrillDownModalTrigger.tsx', () => ({
    DrillDownModalTrigger: ({
        children,
    }: ComponentProps<typeof DrillDownModalTrigger>) => children,
}))
const getSortedAgentsMock = assumeMock(getSortedAgents)
const getPaginatedAgentsMock = assumeMock(getPaginatedAgents)
const getPageStatsFiltersMock = assumeMock(getPageStatsFilters)

jest.mock('pages/stats/MedianFirstResponseTimeCellContent.tsx')
const MedianFirstResponseTimeCellContentMock = assumeMock(
    MedianFirstResponseTimeCellContent
)
jest.mock('pages/stats/TicketsRepliedCellContent.tsx')
const TicketsRepliedCellContentMock = assumeMock(TicketsRepliedCellContent)

jest.mock('pages/stats/ClosedTicketsCellContent.tsx')
const ClosedTicketsCellContentMock = assumeMock(ClosedTicketsCellContent)

jest.mock('pages/stats/MessagesSentCellContent.tsx')
const MessagesSentCellContentMock = assumeMock(MessagesSentCellContent)
jest.mock('pages/stats/MedianResolutionTimeCellContent.tsx')
const MedianResolutionTimeCellContentMock = assumeMock(
    MedianResolutionTimeCellContent
)
jest.mock('pages/stats/CustomerSatisfactionCellContent.tsx')
const CustomerSatisfactionCellContentMock = assumeMock(
    CustomerSatisfactionCellContent
)
jest.mock('pages/stats/PercentageOfClosedTicketsCellContent.tsx')
const PercentageOfClosedTicketsCellContentMock = assumeMock(
    PercentageOfClosedTicketsCellContent
)
jest.mock('pages/stats/OneTouchTicketsCellContent.tsx')
const OneTouchTicketsCellContentMock = assumeMock(OneTouchTicketsCellContent)
jest.mock('pages/stats/OnlineTimeCellContent.tsx')
const OnlineTimeCellContentMock = assumeMock(OnlineTimeCellContent)

jest.mock('pages/stats/AgentsHeaderCellContent.tsx')
const AgentsHeaderCellContentMock = assumeMock(AgentsHeaderCellContent)

jest.mock('pages/stats/MessagesSentPerHourCellContent.tsx')
const MessagesSentPerHourCellContentMock = assumeMock(
    MessagesSentPerHourCellContent
)

jest.mock('pages/stats/TicketsRepliedPerHourCellContent.tsx')
const TicketsRepliedPerHourCellContentMock = assumeMock(
    TicketsRepliedPerHourCellContent
)

jest.mock('pages/stats/ClosedTicketsPerHourCellContent.tsx')
const ClosedTicketsPerHourCellContentMock = assumeMock(
    ClosedTicketsPerHourCellContent
)

jest.mock('pages/stats/AgentsTableSummaryCell.tsx')
const AgentsTableSummaryCellMock = assumeMock(AgentsTableSummaryCell)

const cellMock = () => <div />

describe('<AgentTable>', () => {
    const currentPage = 2
    getSortedAgentsMock.mockReturnValue(agents)
    const paginatedAgents = agents.slice(1)
    getPaginatedAgentsMock.mockReturnValue({
        agents: paginatedAgents,
        currentPage,
        perPage: 1,
    })
    getPageStatsFiltersMock.mockReturnValue({
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
    } as any)
    const metricCells = [
        MedianFirstResponseTimeCellContentMock,
        TicketsRepliedCellContentMock,
        ClosedTicketsCellContentMock,
        MessagesSentCellContentMock,
        MedianResolutionTimeCellContentMock,
        CustomerSatisfactionCellContentMock,
        PercentageOfClosedTicketsCellContentMock,
        OneTouchTicketsCellContentMock,
        OnlineTimeCellContentMock,
        MessagesSentPerHourCellContentMock,
        TicketsRepliedPerHourCellContentMock,
        ClosedTicketsPerHourCellContentMock,
    ]
    metricCells.forEach((metricCell) => metricCell.mockImplementation(cellMock))
    AgentsHeaderCellContentMock.mockImplementation(cellMock)
    AgentsTableSummaryCellMock.mockImplementation(cellMock)

    jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
        [FeatureFlagKey.AnalyticsTimeBasedMetrics]: true,
    }))

    it('should render the table title, table header and rows', () => {
        render(
            <Provider store={mockStore({})}>
                <AgentsTable />
            </Provider>
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
        TableColumnsOrderWithOnlineTime.forEach((column) => {
            expect(AgentsHeaderCellContentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    column,
                }),
                {}
            )
        })

        metricCells.forEach((metricCell) => {
            expect(metricCell).toHaveBeenCalledWith(
                expect.objectContaining({
                    agent: paginatedAgents[0],
                }),
                {}
            )
        })
    })

    it('should handle table scrolling', async () => {
        render(
            <Provider store={mockStore({})}>
                <AgentsTable />
            </Provider>
        )
        act(() => {
            const tableRow = document.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, {target: {scrollLeft: 50}})
        })

        await waitFor(() => {
            expect(screen.getAllByRole('cell')[0]).toHaveClass('withShadow')
        })
    })

    it('should handle table scrolling to the left border', async () => {
        render(
            <Provider store={mockStore({})}>
                <AgentsTable />
            </Provider>
        )
        act(() => {
            const tableRow = document.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, {target: {scrollLeft: 0}})
        })

        await waitFor(() => {
            expect(screen.getAllByRole('cell')[0]).not.toHaveClass('withShadow')
        })
    })

    describe('Pagination', () => {
        it('should render if there are more agents then perPage', () => {
            render(
                <Provider store={mockStore({})}>
                    <AgentsTable />
                </Provider>
            )

            expect(screen.getByText(currentPage)).toBeInTheDocument()
        })

        it('should not render if less agent then perPage', () => {
            getPaginatedAgentsMock.mockReturnValue({
                agents,
                currentPage: 1,
                perPage: agents.length + 1,
            })

            render(
                <Provider store={mockStore({})}>
                    <AgentsTable />
                </Provider>
            )

            expect(screen.queryByText(currentPage)).not.toBeInTheDocument()
        })

        it('should dispatch pageSet action on click', () => {
            const store = mockStore({})
            const pageToClick = currentPage - 1
            getPaginatedAgentsMock.mockReturnValue({
                agents,
                currentPage,
                perPage: 1,
            })

            render(
                <Provider store={store}>
                    <AgentsTable />
                </Provider>
            )
            act(() => {
                const pageButton = screen.getByText(pageToClick)
                userEvent.click(pageButton)
            })

            expect(store.getActions()).toContainEqual(pageSet(pageToClick))
        })
    })
})
