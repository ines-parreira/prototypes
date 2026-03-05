import type { IconName } from '@gorgias/axiom'

import type { AccordionItemProps } from '../../Accordion/Accordion'
import { Accordion } from '../../Accordion/Accordion'

type NavigationSectionProps = AccordionItemProps & {
    icon?: IconName
    to?: string
    isSelected?: boolean
}

export function NavigationSection({
    children,
    ...props
}: NavigationSectionProps) {
    return <Accordion.Item {...props}>{children}</Accordion.Item>
}
