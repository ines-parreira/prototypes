import type { ReactNode } from 'react'
import React from 'react'

import type { GroupOptions } from 'sortablejs'

import { useAppDispatch } from 'hooks/useAppDispatch'
import {
    cancelDrag,
    drag,
    drop,
    stopWidgetEdition,
} from 'state/widgets/actions'

import { isSortableEvent, ReactSortable } from './ReactSortable'

type Props = {
    children: ReactNode
    group: GroupOptions
    isEditing: boolean
    sort?: boolean
    templatePath?: string
    watchDrop?: boolean
    tag?: keyof JSX.IntrinsicElements | null
    filter?: string
    draggableSelector?: string
}

function DragWrapper({
    children,
    sort = false,
    group,
    templatePath = '',
    isEditing,
    watchDrop = false,
    tag = 'div',
    filter,
    draggableSelector = '.draggable',
}: Props) {
    const dispatch = useAppDispatch()

    if (!isEditing) {
        return <>{children}</>
    }

    return (
        <ReactSortable
            options={{
                sort,
                draggable: draggableSelector,
                ...(filter ? { filter } : {}),
                group,
                animation: 150,
                onStart() {
                    dispatch(stopWidgetEdition())
                    dispatch(drag(group.name))
                },
                onEnd() {
                    dispatch(cancelDrag())
                },
            }}
            tag={tag}
            onChange={(order, sortable, evt) => {
                if (watchDrop && isSortableEvent(evt)) {
                    if (evt.type === 'add' || evt.type === 'update') {
                        const key = evt.item.dataset.key
                        const childKey = (el: Element | undefined) =>
                            el instanceof HTMLElement
                                ? el.dataset.key
                                : undefined
                        const rawToKeyStr = childKey(
                            evt.to?.children[evt.newIndex as number],
                        )
                        // ReactSortable's revert is buggy for drag-up-by-1:
                        // the dragged item lands back at newIndex instead of
                        // oldIndex, so children[newIndex] points to the item
                        // itself. Detect this and read children[newIndex+1].
                        const toKeyStr =
                            rawToKeyStr === key
                                ? childKey(
                                      evt.to?.children[
                                          (evt.newIndex as number) + 1
                                      ],
                                  )
                                : rawToKeyStr
                        const toIndex =
                            toKeyStr !== undefined && !isNaN(Number(toKeyStr))
                                ? parseInt(toKeyStr, 10)
                                : evt.newIndex
                        dispatch(
                            drop(
                                evt.type,
                                templatePath,
                                key,
                                toIndex,
                                evt.oldIndex,
                            ),
                        )
                    }
                }
            }}
        >
            {children}
        </ReactSortable>
    )
}

export { DragWrapper }
