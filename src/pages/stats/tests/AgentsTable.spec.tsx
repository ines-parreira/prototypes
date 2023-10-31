import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {agents} from 'fixtures/agents'
import {AgentsHeaderCellContent} from 'pages/stats/AgentsHeaderCellContent'
import {AgentsTable} from 'pages/stats/AgentsTable'
import {ClosedTicketsCellContent} from 'pages/stats/ClosedTicketsCellContent'
import {ClosedTicketsCellSummary} from 'pages/stats/ClosedTicketsCellSummary'
import {CustomerSatisfactionCellContent} from 'pages/stats/CustomerSatisfactionCellContent'
import {CustomerSatisfactionCellSummary} from 'pages/stats/CustomerSatisfactionCellSummary'
import {MedianFirstResponseTimeCellContent} from 'pages/stats/MedianFirstResponseTimeCellContent'
import {MedianFirstResponseTimeCellSummary} from 'pages/stats/MedianFirstResponseTimeCellSummary'
import {MessagesSentCellContent} from 'pages/stats/MessagesSentCellContent'
import {MessagesSentCellSummary} from 'pages/stats/MessagesSentCellSummary'
import {PercentageOfClosedTicketsCellContent} from 'pages/stats/PercentageOfClosedTicketsCellContent'
import {PercentageOfClosedTicketsCellSummary} from 'pages/stats/PercentageOfClosedTicketsCellSummary'
import {MedianResolutionTimeCellContent} from 'pages/stats/MedianResolutionTimeCellContent'
import {MedianResolutionTimeCellSummary} from 'pages/stats/MedianResolutionTimeCellSummary'
import {TableColumnsOrder} from 'pages/stats/TableConfig'
import {TicketsRepliedCellContent} from 'pages/stats/TicketsRepliedCellContent'
import {TicketsRepliedCellSummary} from 'pages/stats/TicketsRepliedCellSummary'
import {OneTouchTicketsCellContent} from 'pages/stats/OneTouchTicketsCellContent'
import {OneTouchTicketsCellSummary} from 'pages/stats/OneTouchTicketsCellSummary'

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
const getSortedAgentsMock = assumeMock(getSortedAgents)
const getPaginatedAgentsMock = assumeMock(getPaginatedAgents)

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

jest.mock('pages/stats/MedianFirstResponseTimeCellSummary.tsx')
const MedianFirstResponseTimeCellSummaryMock = assumeMock(
    MedianFirstResponseTimeCellSummary
)
jest.mock('pages/stats/TicketsRepliedCellSummary.tsx')
const TicketsRepliedCellSummaryMock = assumeMock(TicketsRepliedCellSummary)

jest.mock('pages/stats/ClosedTicketsCellSummary.tsx')
const ClosedTicketsCellSummaryMock = assumeMock(ClosedTicketsCellSummary)

jest.mock('pages/stats/MessagesSentCellSummary.tsx')
const MessagesSentCellSummaryMock = assumeMock(MessagesSentCellSummary)
jest.mock('pages/stats/MedianResolutionTimeCellSummary.tsx')
const MedianResolutionTimeCellSummaryMock = assumeMock(
    MedianResolutionTimeCellSummary
)
jest.mock('pages/stats/CustomerSatisfactionCellSummary.tsx')
const CustomerSatisfactionCellSummaryMock = assumeMock(
    CustomerSatisfactionCellSummary
)
jest.mock('pages/stats/PercentageOfClosedTicketsCellSummary.tsx')
const PercentageOfClosedTicketsCellSummaryMock = assumeMock(
    PercentageOfClosedTicketsCellSummary
)
jest.mock('pages/stats/OneTouchTicketsCellSummary.tsx')
const OneTouchTicketsCellSummaryMock = assumeMock(OneTouchTicketsCellSummary)

jest.mock('pages/stats/AgentsHeaderCellContent.tsx')
const AgentsHeaderCellContentMock = assumeMock(AgentsHeaderCellContent)
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
    const metricCells = [
        MedianFirstResponseTimeCellContentMock,
        TicketsRepliedCellContentMock,
        ClosedTicketsCellContentMock,
        MessagesSentCellContentMock,
        MedianResolutionTimeCellContentMock,
        CustomerSatisfactionCellContentMock,
        PercentageOfClosedTicketsCellContentMock,
        OneTouchTicketsCellContentMock,
    ]
    metricCells.forEach((metricCell) => metricCell.mockImplementation(cellMock))
    AgentsHeaderCellContentMock.mockImplementation(cellMock)

    const metricSummaryCells = [
        MedianFirstResponseTimeCellSummaryMock,
        TicketsRepliedCellSummaryMock,
        ClosedTicketsCellSummaryMock,
        MessagesSentCellSummaryMock,
        MedianResolutionTimeCellSummaryMock,
        CustomerSatisfactionCellSummaryMock,
        PercentageOfClosedTicketsCellSummaryMock,
        OneTouchTicketsCellSummaryMock,
    ]
    metricSummaryCells.forEach((metricCell) =>
        metricCell.mockImplementation(cellMock)
    )

    it('should render the table title, table header and rows', () => {
        render(
            <Provider store={mockStore({})}>
                <AgentsTable />
            </Provider>
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
        TableColumnsOrder.forEach((column) => {
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
                    agentId: paginatedAgents[0].id,
                }),
                {}
            )
        })
    })

    it('should render the table summary row', () => {
        render(
            <Provider store={mockStore({})}>
                <AgentsTable />
            </Provider>
        )
        expect(screen.getByText('Average')).toBeInTheDocument()
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
            expect(
                screen.getByRole('cell', {
                    name: new RegExp('Average'),
                })
            ).toHaveClass('withShadow')
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
