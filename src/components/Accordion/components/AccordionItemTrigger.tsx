import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, MouseEvent } from 'react'

import classNames from 'classnames'

import { useAccordion } from '../hooks/useAccordion'
import { useAccordionItem } from '../hooks/useAccordionItem'
import { AccordionIds } from '../utils/accessibility-ids'
import { AccordionState } from '../utils/accordion-state'

import css from './AccordionItemTrigger.less'

export type AccordionItemTriggerProps = ComponentPropsWithoutRef<'button'>

export const AccordionItemTrigger = forwardRef<
    HTMLButtonElement,
    AccordionItemTriggerProps
>(function AccordionItemTrigger(
    { children, className, onClick, ...props },
    ref,
) {
    const { handleValueChange, disabled: rootDisabled, id } = useAccordion()
    const { isOpen, value, disabled: itemDisabled } = useAccordionItem()

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        handleValueChange(value)
        onClick?.(event)
    }

    return (
        <button
            ref={ref}
            {...props}
            onClick={handleClick}
            data-state={isOpen ? AccordionState.Open : AccordionState.Closed}
            aria-expanded={isOpen}
            id={AccordionIds.trigger(id, value)}
            aria-controls={AccordionIds.content(id, value)}
            disabled={rootDisabled || itemDisabled}
            className={classNames(css.trigger, className)}
        >
            {children}
        </button>
    )
})
