import classNames from 'classnames'
import React, {useRef} from 'react'
import {useDrag, useDrop, DropTargetMonitor} from 'react-dnd'

import css from 'pages/stats/custom-reports/DraggableGridCell.less'
import {CustomReportChartSchema} from 'pages/stats/custom-reports/types'
import DashboardGridCell from 'pages/stats/DashboardGridCell'

export const createDragItem = ({
    size,
    schema,
}: {
    size: number
    schema: CustomReportChartSchema
}) => ({
    ...schema,
    size,
})

type DragItem = ReturnType<typeof createDragItem>

export const createMoveHandler =
    (node: HTMLElement | null, target: DragItem, handleMove: MoveHandler) =>
    (item: DragItem, monitor: DropTargetMonitor) => {
        if (!node) return

        const dragItem = item
        const hoverItem = target

        const hoverSize = target.size

        if (dragItem.config_id === hoverItem.config_id) return

        const hoverRect = node.getBoundingClientRect()

        const hoverMiddleX = (hoverRect.right - hoverRect.left) / 2
        const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2

        // Get mouse position
        const clientOffset = monitor.getClientOffset()!
        const hoverClientX = clientOffset.x - hoverRect.left
        const hoverClientY = clientOffset.y - hoverRect.top

        let position: 'before' | 'after' | null = null

        if (hoverSize === 12) {
            if (hoverClientY > hoverMiddleY) {
                position = 'after'
            } else if (hoverClientY < hoverMiddleY) {
                position = 'before'
            }
        } else {
            if (hoverClientX > hoverMiddleX || hoverClientY > hoverMiddleY) {
                position = 'after'
            } else if (
                hoverClientX < hoverMiddleX ||
                hoverClientY < hoverMiddleY
            ) {
                position = 'before'
            }
        }

        if (position) {
            handleMove(dragItem.config_id, hoverItem.config_id, position)
        }
    }

export type MoveHandler = (
    srcId: string,
    targetId: string,
    position: 'after' | 'before'
) => void

export type DropHandler = () => void

export type DraggableGridCellProps = {
    children: React.ReactNode
    size: number
    schema: CustomReportChartSchema
    onMove: MoveHandler
    onDrop: DropHandler
}

export const DraggableGridCell = ({
    children,
    size,
    schema,
    onDrop,
    onMove,
}: DraggableGridCellProps) => {
    const nodeRef = useRef<HTMLDivElement>(null)

    const item = createDragItem({size, schema})

    const [{isDragging}, dragRef] = useDrag({
        item,
        collect: (monitor) => ({isDragging: monitor.isDragging()}),
    })

    const [, dropRef] = useDrop<typeof item, void, void>({
        accept: item.type,
        hover: createMoveHandler(nodeRef.current, item, onMove),
        drop: onDrop,
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
