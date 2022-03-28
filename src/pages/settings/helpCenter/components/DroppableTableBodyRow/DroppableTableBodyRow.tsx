import classNames from 'classnames'
import React, {Ref, RefObject, useEffect} from 'react'
import {Category} from 'models/helpCenter/types'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import {
    Callbacks,
    DragItemRequired,
    useReorderDnD,
} from '../../hooks/useReorderDnD'
import {getCategoryDndType} from '../../utils/getCategoryDndType'

import css from './DroppableTableBodyRow.less'

export type RowEventListeners = {
    onRowClick?: () => void
    onMoveEntity: Callbacks['onHover']
    onDropEntity?: Callbacks['onDrop']
    onCancelDnD?: Callbacks['onCancel']
}

type DroppableTableBodyRowProps = RowEventListeners & {
    dragItem: DragItem
    children: React.ReactNode
    onDragStart: () => void
    className?: string
    category: Category
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
    onCancelDnD,
    className,
    category,
}: DroppableTableBodyRowProps): JSX.Element => {
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        dragItem,
        [getCategoryDndType(category.parent_category_id)],
        {onHover: onMoveEntity, onDrop: onDropEntity, onCancel: onCancelDnD}
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
            <BodyCell style={{width: 25}}>
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
