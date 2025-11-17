import type { AccordionItemProps } from '../../Accordion/Accordion'
import { Accordion } from '../../Accordion/Accordion'

export function NavigationSection({ children, ...props }: AccordionItemProps) {
    return <Accordion.Item {...props}>{children}</Accordion.Item>
}
