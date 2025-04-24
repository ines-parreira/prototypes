import { AccordionItemContext } from '../contexts/accordion-item-context'
import { useAccordion } from '../hooks/useAccordion'
import { AccordionValue } from '../utils/types'

export type AccordionItemProps = {
    /**
     * The unique identifier of the accordion item.
     */
    value: AccordionValue
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
    const { values: rootValues } = useAccordion()

    const isOpen = rootValues.includes(value)

    return (
        <AccordionItemContext.Provider value={{ isOpen, value, disabled }}>
            {children}
        </AccordionItemContext.Provider>
    )
}

AccordionItem.displayName = 'AccordionItem'
