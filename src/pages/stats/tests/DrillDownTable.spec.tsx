import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'
import {DrillDownTable} from 'pages/stats/DrillDownTable'
import {useDrillDownData} from 'pages/stats/useDrillDownData'
import {getDrillDownMetricColumn} from 'state/ui/stats/drillDownSlice'
import {TicketMessageSourceType} from 'business/types/ticket'

jest.mock('state/ui/stats/drillDownSlice')
const getDrillDownMetricColumnMock = assumeMock(getDrillDownMetricColumn)
jest.mock('pages/stats/useDrillDownData')
const useDrillDownDataMock = assumeMock(useDrillDownData)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<DrillDownTable />', () => {
    const currentPage = 1
    const agentName = 'Agent name'
    const ticketSubject = 'Ticket subject'
    const data = [
        {
            ticket: {
                id: 1,
                channel: TicketMessageSourceType.Chat,
                description: 'description',
                isRead: false,
                subject: ticketSubject,
            },
            contactReason: 'reason',
            assignee: {
                id: 1,
                name: agentName,
            },
            created: '22/12/2023',
            metricValue: 15,
        },
    ]
    useDrillDownDataMock.mockReturnValue({
        data,
        currentPage,
        perPage: 1,
    } as any)
    getDrillDownMetricColumnMock.mockReturnValue({
        showMetric: false,
        metricTitle: '',
        metricValueFormat: 'decimal',
    })

    it('should render the table title, table header and rows', () => {
        render(
            <Provider store={mockStore({})}>
                <DrillDownTable />
            </Provider>
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('should render metric cell', () => {
        const metricTitle = 'Metric title'
        getDrillDownMetricColumnMock.mockReturnValue({
            showMetric: true,
            metricTitle,
            metricValueFormat: 'decimal',
        })

        render(
            <Provider store={mockStore({})}>
                <DrillDownTable />
            </Provider>
        )

        expect(screen.getByText(metricTitle)).toBeInTheDocument()
    })
})
