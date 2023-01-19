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
}

const AccordionItem = ({
    id: idProp,
    isDisabled = false,
    children,
}: AccordionItemProps) => {
    const randomId = useId()
    const id = idProp || randomId

    const {expandedItem, toggleItem} = useAccordionContext()

    const accordionItemContext: AccordionItemContextType = useMemo(
        () => ({
            isExpanded: expandedItem === id,
            isDisabled,
            toggleItem: () => {
                if (!isDisabled) {
                    toggleItem(id)
                }
            },
        }),
        [expandedItem, id, isDisabled, toggleItem]
    )

    return (
        <AccordionItemContext.Provider value={accordionItemContext}>
            <div
                className={classnames(css.container, {
                    [css.isExpanded]: accordionItemContext.isExpanded,
                    [css.isDisabled]: accordionItemContext.isDisabled,
                })}
            >
                {children}
            </div>
        </AccordionItemContext.Provider>
    )
}

export default AccordionItem
