import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {PercentageOfClosedTicketsCellContent} from 'pages/stats/PercentageOfClosedTicketsCellContent'
import {TableColumnsOrder} from 'pages/stats/TableConfig'
import {AgentsHeaderCellContent} from 'pages/stats/AgentsHeaderCellContent'
import {ClosedTicketsCellContent} from 'pages/stats/ClosedTicketsCellContent'
import {CustomerSatisfactionCellContent} from 'pages/stats/CustomerSatisfactionCellContent'
import {FirstResponseTimeCellContent} from 'pages/stats/FirstResponseTimeCellContent'
import {MessagesSentCellContent} from 'pages/stats/MessagesSentCellContent'
import {ResolutionTimeCellContent} from 'pages/stats/ResolutionTimeCellContent'
import {TicketsRepliedCellContent} from 'pages/stats/TicketsRepliedCellContent'

import {RootState, StoreDispatch} from 'state/types'
import {AgentsTable} from 'pages/stats/AgentsTable'
import {selectSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
import {assumeMock} from 'utils/testing'
import {agents} from 'fixtures/agents'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('state/ui/stats/agentPerformanceSlice')
const selectSortedAgentsMock = assumeMock(selectSortedAgents)

jest.mock('pages/stats/FirstResponseTimeCellContent.tsx')
const FirstResponseTimeCellContentMock = assumeMock(
    FirstResponseTimeCellContent
)
jest.mock('pages/stats/TicketsRepliedCellContent.tsx')
const TicketsRepliedCellContentMock = assumeMock(TicketsRepliedCellContent)

jest.mock('pages/stats/ClosedTicketsCellContent.tsx')
const ClosedTicketsCellContentMock = assumeMock(ClosedTicketsCellContent)

jest.mock('pages/stats/MessagesSentCellContent.tsx')
const MessagesSentCellContentMock = assumeMock(MessagesSentCellContent)
jest.mock('pages/stats/ResolutionTimeCellContent.tsx')
const ResolutionTimeCellContentMock = assumeMock(ResolutionTimeCellContent)
jest.mock('pages/stats/CustomerSatisfactionCellContent.tsx')
const CustomerSatisfactionCellContentMock = assumeMock(
    CustomerSatisfactionCellContent
)
jest.mock('pages/stats/PercentageOfClosedTicketsCellContent.tsx')
const PercentageOfClosedTicketsCellContentMock = assumeMock(
    PercentageOfClosedTicketsCellContent
)
jest.mock('pages/stats/AgentsHeaderCellContent.tsx')
const AgentsHeaderCellContentMock = assumeMock(AgentsHeaderCellContent)
const cellMock = () => <div />

describe('<AgentTable>', () => {
    selectSortedAgentsMock.mockReturnValue(agents)
    const metricCells = [
        FirstResponseTimeCellContentMock,
        TicketsRepliedCellContentMock,
        ClosedTicketsCellContentMock,
        MessagesSentCellContentMock,
        ResolutionTimeCellContentMock,
        CustomerSatisfactionCellContentMock,
        PercentageOfClosedTicketsCellContentMock,
    ]
    metricCells.forEach((metricCell) => metricCell.mockImplementation(cellMock))
    AgentsHeaderCellContentMock.mockImplementation(cellMock)

    afterAll(jest.clearAllMocks)

    it('should render the table title, table header and rows', () => {
        render(
            <Provider store={mockStore({})}>
                <AgentsTable />
            </Provider>
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
        TableColumnsOrder.forEach((column) => {
            expect(AgentsHeaderCellContentMock).toHaveBeenCalledWith(
                {
                    column,
                },
                {}
            )
        })

        metricCells.forEach((metricCell) => {
            expect(metricCell).toHaveBeenCalledWith(
                {
                    agentId: agents[0].id,
                },
                {}
            )
        })
    })
})
