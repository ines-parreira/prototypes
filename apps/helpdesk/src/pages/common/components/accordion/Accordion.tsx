import type { HTMLAttributes, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import cn from 'classnames'

import type { AccordionContextType } from './AccordionContext'
import AccordionContext from './AccordionContext'

import css from './Accordion.less'

export type AccordionProps<T = string | string[] | null> = {
    defaultExpandedItem?: T
    expandedItem?: T
    isMulti?: boolean // A flag to enable multiple expanded items when in uncontrolled mode
    onChange?: (expandedItem: T) => void
    onHoveredItemChange?: (hoveredItem: string | null) => void
    children?: ReactNode
} & Pick<HTMLAttributes<HTMLDivElement>, 'className'>

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Disclosure />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const Accordion = <T extends string | string[] | null>({
    defaultExpandedItem = null as T,
    expandedItem: expandedItemProp,
    isMulti,
    onHoveredItemChange,
    onChange,
    children,
    className,
}: AccordionProps<T>) => {
    const isControlled = expandedItemProp !== undefined
    const [expandedItem, setExpandedItem] = useState<T>(
        expandedItemProp !== undefined
            ? expandedItemProp
            : isMulti
              ? ([''] as T)
              : defaultExpandedItem,
    )

    useEffect(() => {
        if (expandedItemProp !== undefined) {
            setExpandedItem(expandedItemProp)
        }
    }, [expandedItemProp])

    const toggleItem = useCallback(
        (itemId: string) => {
            let newExpandedItem: T
            if (Array.isArray(expandedItem)) {
                newExpandedItem = (
                    expandedItem.includes(itemId)
                        ? expandedItem.filter((id) => id !== itemId)
                        : [...expandedItem, itemId]
                ) as T
            } else {
                newExpandedItem = (expandedItem === itemId ? null : itemId) as T
            }
            if (!isControlled) {
                setExpandedItem(newExpandedItem)
            }
            onChange?.(newExpandedItem)
        },
        [expandedItem, isControlled, onChange],
    )

    const accordionContext = useMemo<AccordionContextType>(
        () => ({
            expandedItem,
            toggleItem,
            onHoveredItemChange: (itemId) => {
                onHoveredItemChange?.(itemId)
            },
        }),
        [expandedItem, onHoveredItemChange, toggleItem],
    )

    return (
        <AccordionContext.Provider value={accordionContext}>
            <div className={cn(css.container, className)}>{children}</div>
        </AccordionContext.Provider>
    )
}

export default Accordion
