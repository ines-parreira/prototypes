import { useContext } from 'react'

import { AccordionItemContext } from '../contexts/accordion-item-context'

export const useAccordionItem = () => {
    const context = useContext(AccordionItemContext)
    if (!context) {
        throw new Error('useAccordionItem must be used within a AccordionItem')
    }

    return context
}
