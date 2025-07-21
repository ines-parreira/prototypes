import React, { ReactNode, Ref, RefObject } from 'react'

import classNames from 'classnames'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import css from 'pages/common/components/table/TableBodyRowDraggable.less'
import {
    Callbacks,
    DragItemRequired,
    useReorderDnD,
} from 'pages/common/hooks/useReorderDnD'

type RowEventListeners = {
    onMoveEntity: Callbacks['onHover']
    onDropEntity: Callbacks['onDrop']
    onCancelDnD?: Callbacks['onCancel']
}

type TableBodyRowDraggableProps = RowEventListeners & {
    children: ReactNode
    dragItem: DragItem
    isDragIndicatorInvisible?: boolean
    isDisabled?: boolean
    className?: string
}

export type DragItem = DragItemRequired & {
    [x: string]: any
}

export const TableBodyRowDraggable = ({
    children,
    dragItem,
    isDragIndicatorInvisible = false,
    isDisabled = false,
    onMoveEntity,
    onDropEntity,
    onCancelDnD,
    className,
}: TableBodyRowDraggableProps) => {
    const { dragRef, dropRef, handlerId, isDragging } = useReorderDnD(
        dragItem,
        [dragItem.type],
        { onHover: onMoveEntity, onDrop: onDropEntity, onCancel: onCancelDnD },
    )

    let rowProps: Record<string, unknown> = {
        className,
    }
    if (!isDisabled) {
        rowProps = {
            ...rowProps,
            'data-handler-id': handlerId,
            style: { opacity: isDragging ? 0.5 : 1 },
            ref: dropRef as Ref<HTMLTableRowElement>,
        }
    }

    return (
        <TableBodyRow {...rowProps}>
            <BodyCell className={classNames('align-middle', css.bodyCell)}>
                <div
                    ref={
                        isDisabled
                            ? undefined
                            : (dragRef as RefObject<HTMLDivElement>)
                    }
                    className={classNames('material-icons', css.dragIndicator, {
                        [css.dragIndicatorDisabled]: isDisabled,
                        invisible: isDragIndicatorInvisible,
                    })}
                >
                    drag_indicator
                </div>
            </BodyCell>

            {children}
        </TableBodyRow>
    )
}
