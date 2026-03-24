import React from 'react'

import { userEvent } from '@repo/testing'
import { act, render, screen, waitFor } from '@testing-library/react'

import { AgentsHeaderCellContent } from 'domains/reporting/pages/support-performance/agents/AgentsHeaderCellContent'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'

describe('<AgentsHeaderCellContent>', () => {
    const title = 'Some title'
    const hint = 'Some hint'
    const sortCallback = jest.fn()
    const useSortingQueryMock = jest.fn().mockReturnValue({
        sortCallback,
        direction: OrderDirection.Asc,
        field: AgentsTableColumn.AgentName,
        isOrderedBy: true,
    })

    it('should render title', () => {
        render(
            <AgentsHeaderCellContent
                title={title}
                hint={null}
                useSortingQuery={useSortingQueryMock}
            />,
        )

        expect(screen.getByText(title))
    })

    it('should render hint', async () => {
        render(
            <AgentsHeaderCellContent
                title={title}
                hint={{ title: hint }}
                useSortingQuery={useSortingQueryMock}
            />,
        )

        act(() => {
            const tooltipIcon = document.querySelector('.icon')
            tooltipIcon && userEvent.hover(tooltipIcon)
        })

        await waitFor(() => {
            expect(screen.getByText(hint)).toBeInTheDocument()
        })
    })

    it('should render trigger sorting action on click', () => {
        render(
            <AgentsHeaderCellContent
                title={title}
                hint={null}
                useSortingQuery={useSortingQueryMock}
            />,
        )
        const tr = screen.getByRole('columnheader')
        act(() => {
            userEvent.click(tr)
        })

        expect(sortCallback).toHaveBeenCalled()
    })

    it('should render sorting icon on the column currently sorted', () => {
        useSortingQueryMock.mockReturnValue({
            sortCallback,
            direction: OrderDirection.Asc,
            field: AgentsTableColumn.AgentName,
            isOrderedBy: true,
        })

        render(
            <AgentsHeaderCellContent
                title={title}
                hint={null}
                useSortingQuery={useSortingQueryMock}
            />,
        )
        const sortingIcon = screen.getByText('arrow_downward')

        expect(sortingIcon).toBeInTheDocument()
    })

    it('should not render sorting icon on the column currently not sorted', () => {
        useSortingQueryMock.mockReturnValue({
            sortCallback,
            direction: OrderDirection.Asc,
            field: AgentsTableColumn.AgentName,
            isOrderedBy: false,
        })

        render(
            <AgentsHeaderCellContent
                title={title}
                hint={null}
                useSortingQuery={useSortingQueryMock}
            />,
        )
        const sortingIcon = screen.queryByText('arrow_downward')

        expect(sortingIcon).not.toBeInTheDocument()
    })
})
