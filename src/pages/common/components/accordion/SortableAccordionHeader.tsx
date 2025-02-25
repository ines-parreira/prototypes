import React from 'react'

import classnames from 'classnames'

import AccordionHeader, { AccordionHeaderProps } from './AccordionHeader'
import { useSortableAccordionContext } from './SortableAccordionContext'
import { useSortableAccordionItemContext } from './SortableAccordionItemContext'

import css from './SortableAccordionHeader.less'

type Props = Omit<AccordionHeaderProps, 'action'>

const SortableAccordionHeader = (props: Props) => {
    const { isDisabled } = useSortableAccordionContext()
    const { dragRef } = useSortableAccordionItemContext()

    return (
        <AccordionHeader
            {...props}
            action={
                <div
                    ref={dragRef}
                    className={classnames(css.dragHandle, {
                        [css.isDisabled]: isDisabled,
                    })}
                >
                    <i className="material-icons md-2">drag_indicator</i>
                </div>
            }
        />
    )
}

export default SortableAccordionHeader
