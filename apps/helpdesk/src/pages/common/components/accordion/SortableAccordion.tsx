import type { ReactComponentElement } from 'react'
import React, {
    Children,
    cloneElement,
    isValidElement,
    useMemo,
    useRef,
    useState,
} from 'react'

import _isEqual from 'lodash/isEqual'

import type { AccordionProps } from './Accordion'
import Accordion from './Accordion'
import type { SortableAccordionContextType } from './SortableAccordionContext'
import SortableAccordionContext from './SortableAccordionContext'
import type SortableAccordionItem from './SortableAccordionItem'

type Props<T extends string | string[] | null> = {
    type?: string
    isDisabled?: boolean
    onReorder: (reorderedItems: string[]) => void
} & AccordionProps<T>

type SortableAccordionItemComponent = ReactComponentElement<
    typeof SortableAccordionItem
>

const isSortableAccordionItem = (
    item: Parameters<typeof isValidElement>[0],
): item is SortableAccordionItemComponent => {
    return isValidElement(item)
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Disclosure />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const SortableAccordion = <T extends string | string[] | null>({
    type = 'sortable-accordion',
    isDisabled = false,
    onReorder,
    children,
    ...props
}: Props<T>) => {
    const items = Children.toArray(children).filter(isSortableAccordionItem)

    const itemsById = items.reduce<
        Record<string, SortableAccordionItemComponent>
    >((acc, item) => ({ ...acc, [item.props.id]: item }), {})

    const nextOrderedItems = items.map((item) => item.props.id)
    const orderedItems = useRef(nextOrderedItems)
    const [dirtyOrderedItems, setDirtyOrderedItems] = useState(
        orderedItems.current,
    )

    if (!_isEqual(orderedItems.current, nextOrderedItems)) {
        orderedItems.current = nextOrderedItems

        setDirtyOrderedItems(orderedItems.current)
    }

    const sortableAccordionContext: SortableAccordionContextType = useMemo(
        () => ({
            type,
            isDisabled,
            onMove: (dragIndex, hoverIndex) => {
                const nextDirtyOrderedItems = [...dirtyOrderedItems]
                const dirtyOrderedItem = nextDirtyOrderedItems[dragIndex]

                if (!dirtyOrderedItem) {
                    return
                }

                nextDirtyOrderedItems.splice(dragIndex, 1)
                nextDirtyOrderedItems.splice(hoverIndex, 0, dirtyOrderedItem)

                setDirtyOrderedItems(nextDirtyOrderedItems)
            },
            onDrop: () => {
                if (!_isEqual(dirtyOrderedItems, orderedItems.current)) {
                    onReorder(dirtyOrderedItems)
                }
            },
            onCancel: () => {
                if (!_isEqual(dirtyOrderedItems, orderedItems.current)) {
                    setDirtyOrderedItems(orderedItems.current)
                }
            },
        }),
        [type, isDisabled, onReorder, dirtyOrderedItems],
    )

    return (
        <Accordion {...props}>
            <SortableAccordionContext.Provider value={sortableAccordionContext}>
                {dirtyOrderedItems
                    .filter((id) => id in itemsById)
                    .map((id, index) => cloneElement(itemsById[id], { index }))}
            </SortableAccordionContext.Provider>
        </Accordion>
    )
}

export default SortableAccordion
