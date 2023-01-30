import React, {
    Children,
    cloneElement,
    isValidElement,
    ReactComponentElement,
    useMemo,
    useState,
    useRef,
} from 'react'
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
    const nextOrderedItems = items.map((item) => item.props.id)
    const orderedItems = useRef(nextOrderedItems)
    const [dirtyOrderedItems, setDirtyOrderedItems] = useState(
        orderedItems.current
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
        [type, isDisabled, onReorder, dirtyOrderedItems]
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
