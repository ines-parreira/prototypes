import React, {ReactNode, useEffect, useMemo, useState} from 'react'

import AccordionContext, {AccordionContextType} from './AccordionContext'

import css from './Accordion.less'

export type AccordionProps = {
    defaultExpandedItem?: string | null
    expandedItem?: string | null
    onChange?: (expandedItem: string | null) => void
    onHoveredItemChange?: (hoveredItem: string | null) => void
    children?: ReactNode
}

const Accordion = ({
    defaultExpandedItem = null,
    expandedItem: expandedItemProp,
    onHoveredItemChange,
    onChange,
    children,
}: AccordionProps) => {
    const isControlled = typeof expandedItemProp !== 'undefined'

    const [expandedItem, setExpandedItem] = useState<
        AccordionContextType['expandedItem']
    >(
        typeof expandedItemProp !== 'undefined'
            ? expandedItemProp
            : defaultExpandedItem
    )

    useEffect(() => {
        if (typeof expandedItemProp !== 'undefined') {
            setExpandedItem(expandedItemProp)
        }
    }, [expandedItemProp])

    const accordionContext = useMemo<AccordionContextType>(
        () => ({
            expandedItem,
            toggleItem: (itemId) => {
                const newExpandedItem = expandedItem === itemId ? null : itemId

                if (!isControlled) {
                    setExpandedItem(newExpandedItem)
                }
                onChange?.(newExpandedItem)
            },
            onHoveredItemChange: (itemId) => {
                onHoveredItemChange?.(itemId)
            },
        }),
        [expandedItem, isControlled, onChange, onHoveredItemChange]
    )

    return (
        <AccordionContext.Provider value={accordionContext}>
            <div className={css.container}>{children}</div>
        </AccordionContext.Provider>
    )
}

export default Accordion
