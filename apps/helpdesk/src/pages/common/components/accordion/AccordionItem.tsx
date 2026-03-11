import type { ReactNode } from 'react'
import React, { useMemo } from 'react'

import { useId } from '@repo/hooks'
import classnames from 'classnames'

import { useAccordionContext } from './AccordionContext'
import type { AccordionItemContextType } from './AccordionItemContext'
import AccordionItemContext from './AccordionItemContext'

import css from './AccordionItem.less'

export type AccordionItemProps = {
    id?: string
    isDisabled?: boolean
    children?: ReactNode
    highlightOnExpand?: boolean
    className?: string
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Disclosure />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const AccordionItem = ({
    id: idProp,
    isDisabled = false,
    highlightOnExpand = true,
    children,
    className,
}: AccordionItemProps) => {
    const randomId = useId()
    const id = idProp || randomId

    const { expandedItem, toggleItem, onHoveredItemChange } =
        useAccordionContext()

    const accordionItemContext: AccordionItemContextType = useMemo(
        () => ({
            isExpanded: Array.isArray(expandedItem)
                ? !!expandedItem.find((itemId) => itemId === id)
                : expandedItem === id,
            isDisabled,
            toggleItem: () => {
                if (!isDisabled) {
                    toggleItem(id)
                }
            },
        }),
        [expandedItem, id, isDisabled, toggleItem],
    )

    const handleMouseEnter = () => {
        onHoveredItemChange(id)
    }
    const handleMouseLeave = () => {
        onHoveredItemChange(null)
    }

    return (
        <AccordionItemContext.Provider value={accordionItemContext}>
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={classnames(css.container, className, {
                    [css.isExpanded]:
                        highlightOnExpand && accordionItemContext.isExpanded,
                    [css.isDisabled]: accordionItemContext.isDisabled,
                })}
            >
                {children}
            </div>
        </AccordionItemContext.Provider>
    )
}

export default AccordionItem
