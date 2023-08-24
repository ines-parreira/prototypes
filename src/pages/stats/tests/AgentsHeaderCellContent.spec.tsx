import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {useSortingQueries} from 'hooks/reporting/useSortingQueries'
import {OrderDirection} from 'models/api/types'
import {AgentsHeaderCellContent} from 'pages/stats/AgentsHeaderCellContent'
import {TableLabels} from 'pages/stats/TableConfig'
import {TableColumn} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useSortingQueries')
const useSortingQueriesMock = assumeMock(useSortingQueries)

describe('<AgentsHeaderCellContent>', () => {
    const sortCallback = jest.fn()
    useSortingQueriesMock.mockReturnValue({
        sortCallback,
        direction: OrderDirection.Asc,
        field: TableColumn.AgentName,
    })

    it('should render column label', () => {
        const column = TableColumn.AgentName

        render(<AgentsHeaderCellContent column={column} />)

        expect(screen.getByText(TableLabels[column]))
    })

    it('should render trigger sorting action on click', () => {
        const sortableColumn = TableColumn.FirstResponseTime

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
        const sortingIcon = screen.getByText('arrow_drop_up')

        expect(sortingIcon).toBeInTheDocument()
    })

    it('should not render sorting icon on the column currently not sorted', () => {
        const column = TableColumn.FirstResponseTime

        render(<AgentsHeaderCellContent column={column} />)
        const sortingIcon = screen.queryByText('arrow_drop_up')

        expect(sortingIcon).not.toBeInTheDocument()
    })
})
