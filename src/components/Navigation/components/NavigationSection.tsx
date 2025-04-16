import { Accordion, AccordionItemProps } from '../../Accordion/Accordion'

export function NavigationSection({ children, ...props }: AccordionItemProps) {
    return <Accordion.Item {...props}>{children}</Accordion.Item>
}
