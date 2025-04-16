import classNames from 'classnames'

import { Accordion } from 'components/Accordion/Accordion'
import { AccordionItemContentProps } from 'components/Accordion/components/AccordionItemContent'

import css from './NavigationSectionContent.less'

export function NavigationSectionContent({
    children,
    className,
    ...props
}: AccordionItemContentProps) {
    return (
        <Accordion.ItemContent
            {...props}
            className={classNames(css.navigationSectionContent, className)}
        >
            {children}
        </Accordion.ItemContent>
    )
}
