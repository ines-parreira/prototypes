import React, {ReactNode} from 'react'
import {GroupOptions} from 'sortablejs'
import useAppDispatch from 'hooks/useAppDispatch'

import {stopWidgetEdition, drag, cancelDrag, drop} from 'state/widgets/actions'
import ReactSortable, {isSortableEvent} from './ReactSortable'

type Props = {
    children: ReactNode
    group: GroupOptions
    isEditing: boolean
    sort?: boolean
    templatePath?: string
    watchDrop?: boolean
    tag?: keyof JSX.IntrinsicElements | null
}

function DragWrapper({
    children,
    sort = false,
    group,
    templatePath = '',
    isEditing,
    watchDrop = false,
    tag = 'div',
}: Props) {
    const dispatch = useAppDispatch()

    if (!isEditing) {
        return <>{children}</>
    }

    return (
        <ReactSortable
            options={{
                sort,
                draggable: '.draggable',
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
                        dispatch(
                            drop(
                                evt.type,
                                templatePath,
                                key,
                                evt.newIndex,
                                evt.oldIndex
                            )
                        )
                    }
                }
            }}
        >
            {children}
        </ReactSortable>
    )
}

export default DragWrapper
