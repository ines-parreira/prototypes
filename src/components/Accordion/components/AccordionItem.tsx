import { AccordionItemContext } from '../contexts/accordion-item-context'
import { useAccordion } from '../hooks/useAccordion'

export type AccordionItemProps = {
    /**
     * The unique identifier of the accordion item.
     */
    value: string
    /**
     * Use the disabled prop to disable the accordion item.
     * @default false
     */
    disabled?: boolean
    children: React.ReactNode
}

export const AccordionItem = ({
    value,
    disabled,
    children,
}: AccordionItemProps) => {
    const { value: rootValue } = useAccordion()

    const isOpen = rootValue.includes(value)

    return (
        <AccordionItemContext.Provider value={{ isOpen, value, disabled }}>
            {children}
        </AccordionItemContext.Provider>
    )
}

AccordionItem.displayName = 'AccordionItem'
