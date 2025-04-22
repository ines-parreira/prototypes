import { forwardRef } from 'react'

import classNames from 'classnames'

import { Accordion } from 'components/Accordion/Accordion'
import type { AccordionItemContentProps } from 'components/Accordion/components/AccordionItemContent'

import css from './NavigationSectionContent.less'

export const NavigationSectionContent = forwardRef<
    HTMLDivElement,
    AccordionItemContentProps
>(function NavigationSectionContent({ children, className, ...props }, ref) {
    return (
        <Accordion.ItemContent
            ref={ref}
            {...props}
            className={classNames(css.navigationSectionContent, className)}
        >
            {children}
        </Accordion.ItemContent>
    )
})
