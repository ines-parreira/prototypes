import React, {RefObject, useMemo} from 'react'

import {DragItemRequired, useReorderDnD} from 'pages/common/hooks/useReorderDnD'

import AccordionItem, {AccordionItemProps} from './AccordionItem'
import {useSortableAccordionContext} from './SortableAccordionContext'
import SortableAccordionItemContext, {
    SortableAccordionItemContextType,
} from './SortableAccordionItemContext'

type Props = {id: string; index?: number} & Omit<AccordionItemProps, 'id'>

type DragItem = {id: string} & DragItemRequired

const SortableAccordionItem = ({index = 1, ...props}: Props) => {
    const {id} = props
    const {type, isDisabled, onMove, onDrop, onCancel} =
        useSortableAccordionContext()

    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD<DragItem>(
        {id, type, position: index},
        [type],
        {onHover: onMove, onDrop, onCancel},
        !isDisabled
    )

    const sortableAccordionItemContext: SortableAccordionItemContextType =
        useMemo(
            () => ({dragRef: dragRef as RefObject<HTMLDivElement>}),
            [dragRef]
        )

    return (
        <div
            ref={dropRef as RefObject<HTMLDivElement>}
            style={{opacity: isDragging ? 0 : 1}}
            data-handler-id={handlerId}
        >
            <SortableAccordionItemContext.Provider
                value={sortableAccordionItemContext}
            >
                <AccordionItem {...props} />
            </SortableAccordionItemContext.Provider>
        </div>
    )
}

export default SortableAccordionItem
