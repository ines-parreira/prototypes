import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {NumberedPagination} from 'pages/common/components/Paginations'

import {RootState, StoreDispatch} from 'state/types'
import {OverviewMetric} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'
import {DrillDownTable} from 'pages/stats/DrillDownTable'
import {
    DrillDownRowData,
    useDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import {
    DrillDownMetric,
    getDrillDownMetricColumn,
} from 'state/ui/stats/drillDownSlice'
import {TicketChannel, TicketStatus} from 'business/types/ticket'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))
jest.mock('pages/common/components/Paginations')
const numberedPaginationMock = assumeMock(NumberedPagination)

jest.mock('state/ui/stats/drillDownSlice')
const getDrillDownMetricColumnMock = assumeMock(getDrillDownMetricColumn)
jest.mock('hooks/reporting/useDrillDownData')
const useDrillDownDataMock = assumeMock(useDrillDownData)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<DrillDownTable />', () => {
    const currentPage = 1
    const pagesCount = 2
    const agentName = 'Agent name'
    const ticketSubject = 'Ticket subject'
    const metricData: DrillDownMetric = {metricName: OverviewMetric.OpenTickets}
    const exampleRow = {
        ticket: {
            id: 1,
            channel: TicketChannel.Chat,
            description: 'description',
            isRead: true,
            subject: ticketSubject,
            created: '22/12/2023',
            contactReason: 'reason',
            status: TicketStatus.Closed,
        },
        assignee: {
            id: 1,
            name: agentName,
        },
        metricValue: 15,
    }
    const data: DrillDownRowData[] = [
        exampleRow,
        {
            ticket: {
                id: 2,
                channel: null,
                description: null,
                isRead: false,
                subject: null,
                created: null,
                contactReason: null,
                status: TicketStatus.Closed,
            },
            assignee: {
                id: 1,
                name: agentName,
            },
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
    numberedPaginationMock.mockImplementation(() => <div />)

    it('should render the table title, table header and rows', () => {
        render(
            <Provider store={mockStore({})}>
                <DrillDownTable metricData={metricData} />
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
                <DrillDownTable metricData={metricData} />
            </Provider>
        )

        expect(screen.getByText(metricTitle)).toBeInTheDocument()
    })

    it('should not render Avatar if no assignee', () => {
        useDrillDownDataMock.mockReturnValue({
            data: [{...exampleRow, assignee: null}],
            currentPage,
            perPage: 1,
        } as any)

        render(
            <Provider store={mockStore({})}>
                <DrillDownTable metricData={metricData} />
            </Provider>
        )

        expect(document.querySelector('.agent')).not.toBeInTheDocument()
    })

    it('should render the table with skeletons on loading', () => {
        useDrillDownDataMock.mockReturnValue({
            data,
            currentPage,
            perPage: 1,
            isFetching: true,
        } as any)

        render(
            <Provider store={mockStore({})}>
                <DrillDownTable metricData={metricData} />
            </Provider>
        )

        expect(screen.getAllByTestId(MOCK_SKELETON_TEST_ID).length).not.toBe(0)
    })

    it('should redirect to Ticket page on row click', () => {
        useDrillDownDataMock.mockReturnValue({
            data: [{...exampleRow, assignee: null}],
            currentPage,
            perPage: 1,
        } as any)

        render(
            <Provider store={mockStore({})}>
                <DrillDownTable metricData={metricData} />
            </Provider>
        )
        act(() => {
            userEvent.click(screen.getAllByRole('row')[1])
        })

        expect(window.open).toHaveBeenCalledWith(
            `/app/ticket/${exampleRow.ticket.id}`,
            '_blank'
        )
    })

    it('should render Pagination when more then one page of results', () => {
        const onPageChange = jest.fn()
        useDrillDownDataMock.mockReturnValue({
            data,
            currentPage,
            perPage: 1,
            isFetching: true,
            pagesCount,
            onPageChange,
        } as any)

        render(
            <Provider store={mockStore({})}>
                <DrillDownTable metricData={metricData} />
            </Provider>
        )

        expect(numberedPaginationMock).toHaveBeenCalledWith(
            {
                count: pagesCount,
                page: currentPage,
                onChange: onPageChange,
                className: 'pagination',
            },
            {}
        )
    })
})
