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
    })

    afterAll(jest.clearAllMocks)

    it('should render column label', () => {
        const column = TableColumn.AgentName

        render(<AgentsHeaderCellContent column={column} />)

        expect(screen.getByText(TableLabels[column]))
    })

    it('should render sorting icon and trigger sorting action on click', () => {
        const sortableColumn = TableColumn.FirstResponseTime

        render(<AgentsHeaderCellContent column={sortableColumn} />)
        const sortingIcon = screen.getByRole('cell')
        act(() => {
            userEvent.click(sortingIcon)
        })

        expect(sortCallback).toHaveBeenCalled()
    })
})
