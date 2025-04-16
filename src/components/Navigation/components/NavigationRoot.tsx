import { Accordion, AccordionProps } from '../../Accordion/Accordion'

export const NavigationRoot = ({ children, ...props }: AccordionProps) => {
    return <Accordion.Root {...props}>{children}</Accordion.Root>
}
