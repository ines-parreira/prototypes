import classNames from 'classnames'
import React, {ReactNode, Ref, RefObject} from 'react'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import {
    Callbacks,
    DragItemRequired,
    useReorderDnD,
} from 'pages/common/hooks/useReorderDnD'

import css from 'pages/common/components/table/TableBodyRowDraggable.less'

type RowEventListeners = {
    onMoveEntity: Callbacks['onHover']
    onDropEntity: Callbacks['onDrop']
    onCancelDnD?: Callbacks['onCancel']
}

type TableBodyRowDraggableProps = RowEventListeners & {
    children: ReactNode
    dragItem: DragItem
    shouldRenderDragHandle?: boolean
    className?: string
}

export type DragItem = DragItemRequired & {
    [x: string]: any
}

export const TableBodyRowDraggable = ({
    children,
    dragItem,
    shouldRenderDragHandle = true,
    onMoveEntity,
    onDropEntity,
    onCancelDnD,
    className,
}: TableBodyRowDraggableProps): JSX.Element => {
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        dragItem,
        [dragItem.type],
        {onHover: onMoveEntity, onDrop: onDropEntity, onCancel: onCancelDnD}
    )

    const opacity = isDragging ? 0.5 : 1

    return (
        <TableBodyRow
            ref={dropRef as Ref<HTMLTableRowElement>}
            data-handler-id={handlerId}
            style={{opacity}}
            className={className}
        >
            {shouldRenderDragHandle && (
                <BodyCell className={classNames('align-middle', css.bodyCell)}>
                    <div
                        ref={dragRef as RefObject<HTMLDivElement>}
                        className={classNames(
                            'material-icons text-faded',
                            css.dragIndicator,
                            css.dragIndicatorActive
                        )}
                    >
                        drag_indicator
                    </div>
                </BodyCell>
            )}
            {children}
        </TableBodyRow>
    )
}
