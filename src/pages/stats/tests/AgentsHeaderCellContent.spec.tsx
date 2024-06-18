import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {useAgentsSortingQuery} from 'hooks/reporting/useAgentsSortingQuery'
import {OrderDirection} from 'models/api/types'
import {AgentsHeaderCellContent} from 'pages/stats/AgentsHeaderCellContent'
import {
    TableColumnsOrderWithOnlineTime,
    TableLabels,
} from 'pages/stats/AgentsTableConfig'
import {TableColumn} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useAgentsSortingQuery')
const useSortingQueryMock = assumeMock(useAgentsSortingQuery)

describe('<AgentsHeaderCellContent>', () => {
    const sortCallback = jest.fn()
    useSortingQueryMock.mockReturnValue({
        sortCallback,
        direction: OrderDirection.Asc,
        field: TableColumn.AgentName,
    })

    it.each(TableColumnsOrderWithOnlineTime)(
        'should render %column label',
        (column) => {
            render(<AgentsHeaderCellContent column={column} />)

            expect(screen.getByText(TableLabels[column]))
        }
    )

    it('should render trigger sorting action on click', () => {
        const sortableColumn = TableColumn.MedianFirstResponseTime

        render(<AgentsHeaderCellContent column={sortableColumn} />)
        const cell = screen.getByRole('cell')
        act(() => {
            userEvent.click(cell)
        })

        expect(sortCallback).toHaveBeenCalled()
    })

    it('should render sorting icon on the column currently not sorted', () => {
        const sortableColumn = TableColumn.AgentName

        render(<AgentsHeaderCellContent column={sortableColumn} />)
        const sortingIcon = screen.getByText('arrow_upward')

        expect(sortingIcon).toBeInTheDocument()
    })

    it('should not render sorting icon on the column currently not sorted', () => {
        const column = TableColumn.MedianFirstResponseTime

        render(<AgentsHeaderCellContent column={column} />)
        const sortingIcon = screen.queryByText('arrow_upward')

        expect(sortingIcon).not.toBeInTheDocument()
    })
})
