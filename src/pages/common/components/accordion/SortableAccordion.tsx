import React, {
    Children,
    cloneElement,
    isValidElement,
    ReactComponentElement,
    useMemo,
    useState,
} from 'react'
import {useDeepCompareEffect} from 'react-use'
import _isEqual from 'lodash/isEqual'

import Accordion, {AccordionProps} from './Accordion'
import SortableAccordionItem from './SortableAccordionItem'
import SortableAccordionContext, {
    SortableAccordionContextType,
} from './SortableAccordionContext'

type Props = {
    type?: string
    isDisabled?: boolean
    onReorder: (reorderedItems: string[]) => void
} & AccordionProps

type SortableAccordionItemComponent = ReactComponentElement<
    typeof SortableAccordionItem
>

const isSortableAccordionItem = (
    item: Parameters<typeof isValidElement>[0]
): item is SortableAccordionItemComponent => {
    return isValidElement(item)
}

const SortableAccordion = ({
    type = 'sortable-accordion',
    isDisabled = false,
    onReorder,
    children,
    ...props
}: Props) => {
    const items = Children.toArray(children).filter(isSortableAccordionItem)
    const itemsById = items.reduce<
        Record<string, SortableAccordionItemComponent>
    >((acc, item) => ({...acc, [item.props.id]: item}), {})
    const orderedItems = items.map((item) => item.props.id)
    const [dirtyOrderedItems, setDirtyOrderedItems] = useState(orderedItems)

    useDeepCompareEffect(() => {
        setDirtyOrderedItems(orderedItems)
    }, [orderedItems])

    const areOrderedItemsDirty = !_isEqual(dirtyOrderedItems, orderedItems)

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
                if (areOrderedItemsDirty) {
                    onReorder(dirtyOrderedItems)
                }
            },
        }),
        [type, isDisabled, onReorder, dirtyOrderedItems, areOrderedItemsDirty]
    )

    return (
        <Accordion {...props}>
            <SortableAccordionContext.Provider value={sortableAccordionContext}>
                {dirtyOrderedItems
                    .filter((id) => id in itemsById)
                    .map((id, index) => cloneElement(itemsById[id], {index}))}
            </SortableAccordionContext.Provider>
        </Accordion>
    )
}

export default SortableAccordion
