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
import {AgentsTableColumn} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useAgentsSortingQuery')
const useSortingQueryMock = assumeMock(useAgentsSortingQuery)

describe('<AgentsHeaderCellContent>', () => {
    const sortCallback = jest.fn()
    useSortingQueryMock.mockReturnValue({
        sortCallback,
        direction: OrderDirection.Asc,
        field: AgentsTableColumn.AgentName,
    })

    it.each(TableColumnsOrderWithOnlineTime)(
        'should render %column label',
        (column) => {
            render(<AgentsHeaderCellContent column={column} />)

            expect(screen.getByText(TableLabels[column]))
        }
    )

    it('should render trigger sorting action on click', () => {
        const sortableColumn = AgentsTableColumn.MedianFirstResponseTime

        render(<AgentsHeaderCellContent column={sortableColumn} />)
        const tr = screen.getByRole('columnheader')
        act(() => {
            userEvent.click(tr)
        })

        expect(sortCallback).toHaveBeenCalled()
    })

    it('should render sorting icon on the column currently not sorted', () => {
        const sortableColumn = AgentsTableColumn.AgentName

        render(<AgentsHeaderCellContent column={sortableColumn} />)
        const sortingIcon = screen.getByText('arrow_upward')

        expect(sortingIcon).toBeInTheDocument()
    })

    it('should not render sorting icon on the column currently not sorted', () => {
        const column = AgentsTableColumn.MedianFirstResponseTime

        render(<AgentsHeaderCellContent column={column} />)
        const sortingIcon = screen.queryByText('arrow_upward')

        expect(sortingIcon).not.toBeInTheDocument()
    })
})
