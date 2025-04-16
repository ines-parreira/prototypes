import classNames from 'classnames'

import {
    Accordion,
    AccordionItemTriggerProps,
} from 'components/Accordion/Accordion'

import css from './NavigationSectionTrigger.less'

export function NavigationSectionTrigger({
    children,
    className,
    ...props
}: Omit<AccordionItemTriggerProps, 'ref'>) {
    return (
        <Accordion.ItemTrigger
            {...props}
            className={classNames(css.trigger, className)}
        >
            {children}
        </Accordion.ItemTrigger>
    )
}
