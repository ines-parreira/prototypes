import { forwardRef } from 'react'
import type { ComponentProps } from 'react'

import classNames from 'classnames'

import { useAccordionItem } from '../hooks/useAccordionItem'
import { AccordionState } from '../utils/accordion-state'

import css from './AccordionItemIndicator.less'

export type AccordionItemIndicatorProps = ComponentProps<'div'>

export const AccordionItemIndicator = forwardRef<
    HTMLDivElement,
    AccordionItemIndicatorProps
>(function AccordionItemIndicator({ children, className, ...props }, ref) {
    const { isOpen } = useAccordionItem()

    return (
        <div
            ref={ref}
            {...props}
            data-state={isOpen ? AccordionState.Open : AccordionState.Closed}
            className={classNames(css.indicator, className)}
        >
            {children}
        </div>
    )
})
