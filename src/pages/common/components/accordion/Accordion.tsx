import React, {ReactNode, useEffect, useMemo, useState} from 'react'

import AccordionContext, {AccordionContextType} from './AccordionContext'

import css from './Accordion.less'

export type AccordionProps = {
    defaultExpandedItem?: string | false
    expandedItem?: string | false
    onChange?: (expandedItem: string | false) => void
    children?: ReactNode
}

const Accordion = ({
    defaultExpandedItem = false,
    expandedItem: expandedItemProp,
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
                const newExpandedItem = expandedItem === itemId ? false : itemId

                if (!isControlled) {
                    setExpandedItem(newExpandedItem)
                }
                onChange?.(newExpandedItem)
            },
        }),
        [expandedItem, isControlled, onChange]
    )

    return (
        <AccordionContext.Provider value={accordionContext}>
            <div className={css.container}>{children}</div>
        </AccordionContext.Provider>
    )
}

export default Accordion
