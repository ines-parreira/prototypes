import classNames from 'classnames'
import React, {useRef} from 'react'
import {useDrag, useDrop, DropTargetMonitor} from 'react-dnd'

import css from 'pages/stats/custom-reports/DraggableGridCell.less'
import DashboardGridCell from 'pages/stats/DashboardGridCell'

export const createDragItem = ({
    order,
    size,
}: {
    order: number
    size: number
}) => ({
    order,
    size,
    type: 'ChartType.Card',
})

type DragItem = ReturnType<typeof createDragItem>

export const createMoveHandler =
    (
        node: HTMLElement | null,
        target: DragItem,
        handleMove: (srcIndex: number, targetIndex: number) => void
    ) =>
    (item: DragItem, monitor: DropTargetMonitor) => {
        if (!node) return

        const dragIndex = item.order

        const hoverIndex = target.order
        const hoverSize = target.size

        if (dragIndex === hoverIndex) return

        const hoverRect = node.getBoundingClientRect()

        const hoverMiddleX = (hoverRect.right - hoverRect.left) / 2
        const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2

        // Get mouse position
        const clientOffset = monitor.getClientOffset()!
        const hoverClientX = clientOffset.x - hoverRect.left
        const hoverClientY = clientOffset.y - hoverRect.top

        let shouldMove = false

        if (hoverSize === 12) {
            // If hovering over a "big boi", only consider vertical (Y-axis) movement
            shouldMove =
                (dragIndex < hoverIndex && hoverClientY >= hoverMiddleY) ||
                (dragIndex > hoverIndex && hoverClientY <= hoverMiddleY)
        } else {
            // Default behavior: consider both axes for smaller cards
            shouldMove =
                (dragIndex < hoverIndex &&
                    (hoverClientX >= hoverMiddleX ||
                        hoverClientY >= hoverMiddleY)) ||
                (dragIndex > hoverIndex &&
                    (hoverClientX <= hoverMiddleX ||
                        hoverClientY <= hoverMiddleY))
        }

        if (shouldMove) {
            handleMove(dragIndex, hoverIndex)
            item.order = hoverIndex
        }
    }

type DraggableGridCellProps = {
    children: React.ReactNode
    size: number
    order: number
    onMove: (srcIndex: number, targetIndex: number) => void
}

export const DraggableGridCell = ({
    children,
    size,
    order,
    onMove,
}: DraggableGridCellProps) => {
    const nodeRef = useRef<HTMLDivElement>(null)

    const item = createDragItem({order, size})

    const [{isDragging}, dragRef] = useDrag({
        item,
        collect: (monitor) => ({isDragging: monitor.isDragging()}),
    })

    const [, dropRef] = useDrop<typeof item, void, void>({
        accept: item.type,
        hover: createMoveHandler(nodeRef.current, item, onMove),
    })

    dragRef(dropRef(nodeRef))

    return (
        <DashboardGridCell size={size} className="pb-0">
            <div
                ref={nodeRef}
                className={classNames(css.root, isDragging && css.dragging)}
            >
                {children}
            </div>
        </DashboardGridCell>
    )
}
