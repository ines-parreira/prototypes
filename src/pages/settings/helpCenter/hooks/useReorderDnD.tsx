import React from 'react'
import {useDrag, useDrop, DropTargetMonitor} from 'react-dnd'

export type DragItemRequired = {
    type: string
    position: number
}

type useReorderDnDInterface = {
    dragRef: React.RefObject<unknown>
    dropRef: React.RefObject<unknown>
    handlerId: string | symbol | null
    isDragging: boolean
}

export type Callbacks = {
    onHover?: (dragIndex: number, hoverIndex: number, type: string) => void
    onDrop?: (item: unknown, monitor: DropTargetMonitor) => void
    onCancel?: (type: string) => void
}

export const useReorderDnD = <ItemType extends DragItemRequired>(
    dragItem: ItemType,
    acceptEntities: string[],
    callbacks: Callbacks = {}
): useReorderDnDInterface => {
    const $dropRef = React.useRef<HTMLTableRowElement>(null)
    const $dragRef = React.useRef<HTMLDivElement>(null)

    const [{handlerId}, drop] = useDrop({
        accept: acceptEntities,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            }
        },
        drop(item: ItemType, monitor) {
            if (callbacks.onDrop) {
                callbacks.onDrop(item, monitor)
            }
        },
        hover(item: ItemType, monitor) {
            // Prevent hovering effect if the item cannot be dropped here
            if (!$dropRef.current || !monitor.canDrop()) {
                return
            }
            const dragIndex = item.position
            const hoverIndex = dragItem.position
            const type = dragItem.type
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return
            }
            // Determine rectangle on screen
            const hoverBoundingRect = $dropRef.current.getBoundingClientRect()
            // Get vertical middle
            const hoverMiddleY =
                (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            // Determine mouse position
            const clientOffset = monitor.getClientOffset()

            if (clientOffset) {
                // Get pixels to the top
                const hoverClientY = clientOffset.y - hoverBoundingRect.top
                // Only perform the move when the mouse has crossed half of the items height
                // When dragging downwards, only move when the cursor is below 50%
                // When dragging upwards, only move when the cursor is above 50%

                // Dragging downwards
                if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                    return
                }
                // Dragging upwards
                if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                    return
                }

                callbacks?.onHover &&
                    callbacks.onHover(dragIndex, hoverIndex, type)
                item.position = hoverIndex
            }
        },
    })

    const [{isDragging}, drag, preview] = useDrag({
        item: dragItem,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            if (!monitor.didDrop() && callbacks.onCancel) {
                callbacks.onCancel(dragItem.type)
            }
        },
    })

    preview(drop($dropRef))
    drag($dragRef)

    return {
        dragRef: $dragRef,
        dropRef: $dropRef,
        handlerId,
        isDragging,
    }
}
