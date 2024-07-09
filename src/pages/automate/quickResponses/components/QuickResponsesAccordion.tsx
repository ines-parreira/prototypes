import React from 'react'

import SortableAccordion from 'pages/common/components/accordion/SortableAccordion'
import SortableAccordionItem from 'pages/common/components/accordion/SortableAccordionItem'
import {QuickResponsePolicy} from 'models/selfServiceConfiguration/types'

import {useQuickResponsesViewContext} from '../QuickResponsesViewContext'
import {NEW_QUICK_RESPONSE_SYMBOL} from '../constants'
import QuickResponsesAccordionItem from './QuickResponsesAccordionItem'

type Props = {
    items: QuickResponsePolicy[]
    expandedItem: QuickResponsePolicy['id'] | null
    onExpandedItemChange: (
        expandedItem: QuickResponsePolicy['id'] | null
    ) => void
    onHoveredItemChange?: (
        hoveredItem: QuickResponsePolicy['id'] | null
    ) => void
    onPreviewChange: (items: QuickResponsePolicy[]) => void
    onChange: (items: QuickResponsePolicy[]) => void
    onDelete: (items: QuickResponsePolicy[]) => void
}

const QuickResponsesAccordion = ({
    items,
    expandedItem,
    onExpandedItemChange,
    onHoveredItemChange,
    onPreviewChange,
    onChange,
    onDelete,
}: Props) => {
    const {isUpdatePending, isDisabled, hasError} =
        useQuickResponsesViewContext()

    const handleReorder = (reorderedItemIds: QuickResponsePolicy['id'][]) => {
        const itemsById = items.reduce<
            Record<QuickResponsePolicy['id'], QuickResponsePolicy>
        >((acc, item) => ({...acc, [item.id]: item}), {})

        const nextItems = reorderedItemIds.map((id) => itemsById[id])

        onChange(nextItems)
    }
    const handleItemPreviewChange = (nextItem: QuickResponsePolicy) => {
        const nextItems = [...items]
        const index = nextItems.findIndex((item) => item.id === nextItem.id)

        if (index !== -1) {
            nextItems[index] = nextItem
            onPreviewChange(nextItems)
        }
    }
    const handleItemDelete = (id: QuickResponsePolicy['id']) => {
        const nextItems = [...items]
        const index = nextItems.findIndex((item) => item.id === id)

        if (index !== -1) {
            nextItems.splice(index, 1)

            if (NEW_QUICK_RESPONSE_SYMBOL in items[index]) {
                onPreviewChange(nextItems)
            } else {
                onDelete(nextItems)
            }
        }
    }
    const handleItemToggle = (
        id: QuickResponsePolicy['id'],
        deactivatedDatetime: QuickResponsePolicy['deactivatedDatetime']
    ) => {
        const nextItems = [...items]
        const index = nextItems.findIndex((item) => item.id === id)

        if (index !== -1) {
            nextItems[index] = {
                ...nextItems[index],
                deactivatedDatetime,
            }

            onChange(nextItems)
        }
    }

    return (
        <SortableAccordion
            onReorder={handleReorder}
            expandedItem={expandedItem}
            onChange={onExpandedItemChange}
            onHoveredItemChange={onHoveredItemChange}
            isDisabled={isUpdatePending || isDisabled || hasError}
        >
            {items.map((item) => (
                <SortableAccordionItem
                    key={item.id}
                    id={item.id}
                    isDisabled={isDisabled || hasError}
                >
                    <QuickResponsesAccordionItem
                        key={item.id}
                        item={item}
                        onPreviewChange={handleItemPreviewChange}
                        onDelete={handleItemDelete}
                        onToggle={handleItemToggle}
                    />
                </SortableAccordionItem>
            ))}
        </SortableAccordion>
    )
}

export default QuickResponsesAccordion
