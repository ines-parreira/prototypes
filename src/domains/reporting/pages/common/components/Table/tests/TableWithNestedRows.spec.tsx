import React from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TableWithNestedRows } from 'domains/reporting/pages/common/components/Table/TableWithNestedRows'
import { OrderDirection } from 'models/api/types'
import { WithChildren } from 'pages/common/components/table/TableBodyRowExpandable'

enum Column {
    Name = 'name',
    Value = 'value',
}

interface RowProps {
    entityId: string
    value: number
    prevValue: number
}

describe('TableWithNestedRows', () => {
    const mockRowComponent = ({ entityId }: RowProps) => (
        <>
            <td data-testid="row-content">{entityId}</td>
        </>
    )

    const exampleColumnConfig = {
        [Column.Name]: {
            title: 'Name',
            tooltip: { title: 'Name tooltip' },
            useData: () => ({ value: 'test' }),
            isSortable: true,
        },
        [Column.Value]: {
            title: 'Value',
            tooltip: { title: 'Value tooltip' },
            useData: () => ({ value: 'test' }),
            isSortable: true,
        },
    }

    const exampleRows: WithChildren<RowProps>[] = [
        {
            entityId: '1',
            value: 100,
            prevValue: 90,
            children: [
                {
                    entityId: '1.1',
                    value: 30,
                    prevValue: 25,
                    children: [],
                },
                {
                    entityId: '1.2',
                    value: 40,
                    prevValue: 35,
                    children: [],
                },
            ],
        },
        {
            entityId: '2',
            value: 80,
            prevValue: 70,
            children: [],
        },
    ]

    const defaultProps = {
        RowComponent: mockRowComponent,
        rows: exampleRows,
        perPage: 10,
        currentPage: 1,
        setCurrentPage: jest.fn(),
        columnOrder: [Column.Name, Column.Value],
        leadColumn: Column.Name,
        sortingOrder: {
            column: Column.Name,
            direction: OrderDirection.Asc,
        },
        getSetOrderHandler: jest.fn(),
        columnConfig: exampleColumnConfig,
        intentCustomFieldId: 1,
        isLoading: false,
    }

    it('renders header cells with correct titles', () => {
        render(<TableWithNestedRows {...defaultProps} />)

        const headerCells = screen.getAllByRole('columnheader')
        expect(headerCells).toHaveLength(2)
        expect(headerCells[0]).toHaveTextContent('Name')
        expect(headerCells[1]).toHaveTextContent('Value')
    })

    it('handles scroll events correctly', async () => {
        render(<TableWithNestedRows {...defaultProps} />)

        act(() => {
            const tableRow = document.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, { target: { scrollLeft: 50 } })
        })

        await waitFor(() => {
            expect(screen.getAllByRole('columnheader')[0]).toHaveClass(
                'withShadow',
            )
        })
    })

    it('handles scroll events correctly', async () => {
        render(<TableWithNestedRows {...defaultProps} />)

        act(() => {
            const tableRow = document.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, { target: { scrollLeft: 0 } })
        })

        await waitFor(() => {
            expect(screen.getAllByRole('columnheader')[0]).not.toHaveClass(
                'withShadow',
            )
        })
    })

    it('renders pagination when rows exceed perPage', () => {
        const props = {
            ...defaultProps,
            perPage: 1,
        }

        render(<TableWithNestedRows {...props} />)

        expect(screen.getAllByRole('listitem')).toBeTruthy()
    })

    it('does not render pagination when rows are less than perPage', () => {
        const props = {
            ...defaultProps,
            perPage: 10,
        }

        render(<TableWithNestedRows {...props} />)

        expect(screen.queryAllByRole('nav').length).toEqual(0)
    })

    it('calls getSetOrderHandler when header cell is clicked', () => {
        const mockHandler = jest.fn()
        const props = {
            ...defaultProps,
            getSetOrderHandler: mockHandler,
        }

        render(<TableWithNestedRows {...props} />)
        const headerCell = screen.getAllByRole('columnheader')[0]
        fireEvent.click(headerCell)

        expect(mockHandler).toHaveBeenNthCalledWith(1, {
            column: Column.Name,
            direction: OrderDirection.Desc,
        })
    })
})
