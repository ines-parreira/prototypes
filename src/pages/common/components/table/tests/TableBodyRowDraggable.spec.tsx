import React from 'react'

import { render, screen } from '@testing-library/react'

import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import { useReorderDnD } from 'pages/common/hooks/useReorderDnD'

import { TableBodyRowDraggable } from '../TableBodyRowDraggable'

jest.mock('pages/common/hooks/useReorderDnD', () => ({
    useReorderDnD: jest.fn(() => ({
        dragRef: { current: null },
        dropRef: { current: null },
        handlerId: 'handlerId',
        isDragging: false,
    })),
}))

jest.mock('pages/common/components/table/TableBodyRow', () => ({
    __esModule: true,
    default: jest.fn(({ children }) => (
        <table>
            <tbody>
                <tr>{children}</tr>
            </tbody>
        </table>
    )),
}))

const defaultProps = {
    children: <td>children</td>,
    dragItem: {
        type: 'whatever',
        position: 0,
    },
    onMoveEntity: jest.fn(),
    onDropEntity: jest.fn(),
    onCancelDnD: jest.fn(),
    className: 'className',
}

describe('TableBodyRowDraggable', () => {
    it('should call useReorderDnD with correct params', () => {
        render(<TableBodyRowDraggable {...defaultProps} />)

        expect(useReorderDnD).toHaveBeenCalledWith(
            defaultProps.dragItem,
            [defaultProps.dragItem.type],
            {
                onHover: defaultProps.onMoveEntity,
                onDrop: defaultProps.onDropEntity,
                onCancel: defaultProps.onCancelDnD,
            },
        )
    })

    it('should render drag handle', () => {
        render(<TableBodyRowDraggable {...defaultProps} />)
        screen.getByText('drag_indicator')
        expect(
            screen.getByText('drag_indicator').classList.contains('invisible'),
        ).toBe(false)
    })

    it("should call TableBodyRow with correct props when it's disabled", () => {
        render(<TableBodyRowDraggable {...defaultProps} isDisabled />)
        expect(TableBodyRow).toHaveBeenCalledWith(
            expect.objectContaining({
                className: defaultProps.className,
            }),
            {},
        )
    })

    it("should call TableBodyRow with correct props when it's not disabled", () => {
        render(<TableBodyRowDraggable {...defaultProps} />)
        expect(TableBodyRow).toHaveBeenCalledWith(
            expect.objectContaining({
                className: defaultProps.className,
                'data-handler-id': 'handlerId',
                style: { opacity: 1 },
            }),
            {},
        )
    })

    it("should add correct class to drag handle when it's disabled", () => {
        render(<TableBodyRowDraggable {...defaultProps} isDisabled />)
        expect(
            screen
                .getByText('drag_indicator')
                .classList.contains('dragIndicatorDisabled'),
        ).toBe(true)
    })

    it('should render drag handle and make it invisible', () => {
        render(
            <TableBodyRowDraggable
                {...defaultProps}
                isDragIndicatorInvisible={true}
            />,
        )
        expect(
            screen.getByText('drag_indicator').classList.contains('invisible'),
        ).toBe(true)
    })
})
