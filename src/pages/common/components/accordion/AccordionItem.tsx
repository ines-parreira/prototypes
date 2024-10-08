import React, {ReactNode, useMemo} from 'react'
import classnames from 'classnames'

import useId from 'hooks/useId'

import {useAccordionContext} from './AccordionContext'
import AccordionItemContext, {
    AccordionItemContextType,
} from './AccordionItemContext'

import css from './AccordionItem.less'

export type AccordionItemProps = {
    id?: string
    isDisabled?: boolean
    children?: ReactNode
    highlightOnExpand?: boolean
}

const AccordionItem = ({
    id: idProp,
    isDisabled = false,
    highlightOnExpand = true,
    children,
}: AccordionItemProps) => {
    const randomId = useId()
    const id = idProp || randomId

    const {expandedItem, toggleItem, onHoveredItemChange} =
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
        [expandedItem, id, isDisabled, toggleItem]
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
                className={classnames(css.container, {
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
