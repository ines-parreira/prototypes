import type { RefObject } from 'react'
import React, { useMemo } from 'react'

import type { DragItemRequired } from 'pages/common/hooks/useReorderDnD'
import { useReorderDnD } from 'pages/common/hooks/useReorderDnD'

import type { AccordionItemProps } from './AccordionItem'
import AccordionItem from './AccordionItem'
import { useSortableAccordionContext } from './SortableAccordionContext'
import type { SortableAccordionItemContextType } from './SortableAccordionItemContext'
import SortableAccordionItemContext from './SortableAccordionItemContext'

type Props = { id: string; index?: number } & Omit<AccordionItemProps, 'id'>

type DragItem = { id: string } & DragItemRequired

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Disclosure />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const SortableAccordionItem = ({ index = 1, ...props }: Props) => {
    const { id } = props
    const { type, isDisabled, onMove, onDrop, onCancel } =
        useSortableAccordionContext()

    const { dragRef, dropRef, handlerId, isDragging } = useReorderDnD<DragItem>(
        { id, type, position: index },
        [type],
        { onHover: onMove, onDrop, onCancel },
        !isDisabled,
    )

    const sortableAccordionItemContext: SortableAccordionItemContextType =
        useMemo(
            () => ({ dragRef: dragRef as RefObject<HTMLDivElement> }),
            [dragRef],
        )

    return (
        <div
            ref={dropRef as RefObject<HTMLDivElement>}
            style={{ opacity: isDragging ? 0 : 1 }}
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
