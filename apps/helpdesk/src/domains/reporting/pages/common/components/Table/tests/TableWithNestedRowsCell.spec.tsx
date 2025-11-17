import type { ReactElement } from 'react'

import { triggerWidthResize } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import {
    DEFAULT_MARGIN,
    EXPAND_COLUMN_WIDTH,
    MOBILE_EXPAND_COLUMN_WIDTH,
    TableWithNestedRowsCell,
} from 'domains/reporting/pages/common/components/Table/TableWithNestedRowsCell'

const renderCell = (cellComponent: ReactElement) =>
    render(
        <table>
            <tbody>
                <tr>{cellComponent}</tr>
            </tbody>
        </table>,
    )

describe('TableWithNestedRowsCell', () => {
    it('should render provided value', () => {
        const value = 'some value'

        renderCell(
            <TableWithNestedRowsCell
                isLeadColumn={false}
                level={0}
                children={value}
                hasChildren={false}
            />,
        )

        expect(screen.getByText(value)).toBeInTheDocument()
    })

    it('should make the lead column sticky and with shadow when scrolled', () => {
        const value = 'some value'

        renderCell(
            <TableWithNestedRowsCell
                isLeadColumn={true}
                isTableScrolled={true}
                level={0}
                children={value}
                hasChildren={false}
            />,
        )

        const cell = screen.getByRole('cell')
        expect(cell).toHaveClass('sticky')
        expect(cell).toHaveClass('leadColumn')
        expect(cell).toHaveClass('withShadow')
    })

    it('should indent according to nesting level', () => {
        const value = 'some value'
        const level = 1

        renderCell(
            <TableWithNestedRowsCell
                isLeadColumn={true}
                isTableScrolled={true}
                level={level}
                children={value}
                hasChildren={false}
            />,
        )

        const cellContent = document.getElementsByClassName('cellContent')[0]
        expect(cellContent).toHaveStyle(
            `margin-left: ${level * EXPAND_COLUMN_WIDTH + DEFAULT_MARGIN}px;`,
        )
    })

    it('should indent according to nesting level on mobile screens', () => {
        const value = 'some value'
        const level = 1
        const initialWindowSize = window.innerWidth

        triggerWidthResize(480)
        renderCell(
            <TableWithNestedRowsCell
                isLeadColumn={true}
                isTableScrolled={true}
                level={level}
                children={value}
                hasChildren={false}
            />,
        )

        const cellContent = document.getElementsByClassName('cellContent')[0]
        expect(cellContent).toHaveStyle(
            `margin-left: ${level * MOBILE_EXPAND_COLUMN_WIDTH + DEFAULT_MARGIN}px;`,
        )
        triggerWidthResize(initialWindowSize)
    })

    it('should indent when cell with children', () => {
        const value = 'some value'
        const level = 1

        renderCell(
            <TableWithNestedRowsCell
                isLeadColumn={true}
                isTableScrolled={true}
                level={level}
                children={value}
                hasChildren={true}
            />,
        )

        const cellContent = document.getElementsByClassName('cellContent')[0]
        expect(cellContent).toHaveStyle(
            `margin-left: ${level * EXPAND_COLUMN_WIDTH + DEFAULT_MARGIN * 2}px;`,
        )
    })
})
