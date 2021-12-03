import classNames from 'classnames'
import React, {Ref, RefObject, useEffect} from 'react'

import BodyCell from '../../../../common/components/table/cells/BodyCell'
import TableBodyRow from '../../../../common/components/table/TableBodyRow'
import {
    Callbacks,
    DragItemRequired,
    useReorderDnD,
} from '../../hooks/useReorderDnD'
import {DND_ENTITIES} from '../CategoriesTable'

import css from './DroppableTableBodyRow.less'

export type RowEventListeners = {
    onRowClick?: () => void
    onMoveEntity: Callbacks['onHover']
    onDropEntity?: Callbacks['onDrop']
}

type DroppableTableBodyRowProps = RowEventListeners & {
    dragItem: DragItem
    children: React.ReactNode
    onDragStart: () => void
    className?: string
}

type DragItem = DragItemRequired & {
    [x: string]: any
}

export const DroppableTableBodyRow = ({
    dragItem,
    children,
    onDragStart,
    onRowClick,
    onMoveEntity,
    onDropEntity,
    className,
}: DroppableTableBodyRowProps): JSX.Element => {
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        dragItem,
        [DND_ENTITIES.CATEGORY],
        {onHover: onMoveEntity, onDrop: onDropEntity}
    )

    useEffect(() => {
        if (isDragging) {
            onDragStart()
        }
    }, [isDragging])

    const opacity = isDragging ? 0 : 1

    return (
        <TableBodyRow
            ref={dropRef as Ref<HTMLTableRowElement>}
            data-handler-id={handlerId}
            style={{opacity}}
            onClick={onRowClick}
            className={className}
        >
            <BodyCell>
                <div
                    ref={dragRef as RefObject<HTMLDivElement>}
                    className={classNames(
                        css['drag-handler'],
                        'material-icons'
                    )}
                >
                    drag_indicator
                </div>
            </BodyCell>
            {children}
        </TableBodyRow>
    )
}
