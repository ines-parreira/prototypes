import { forwardRef } from 'react'

import classNames from 'classnames'

import { Accordion } from 'components/Accordion/Accordion'
import type { AccordionItemTriggerProps } from 'components/Accordion/components/AccordionItemTrigger'

import css from './NavigationSectionTrigger.less'

export const NavigationSectionTrigger = forwardRef<
    HTMLButtonElement,
    AccordionItemTriggerProps
>(function NavigationSectionTrigger({ children, className, ...props }, ref) {
    return (
        <Accordion.ItemTrigger
            ref={ref}
            {...props}
            className={classNames(css.trigger, className)}
        >
            {children}
        </Accordion.ItemTrigger>
    )
})
