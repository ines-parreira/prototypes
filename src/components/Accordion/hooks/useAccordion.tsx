import { useContext } from 'react'

import { AccordionRootContext } from '../contexts/accordion-root-context'

export const useAccordion = () => {
    const context = useContext(AccordionRootContext)
    if (!context) {
        throw new Error('useAccordion must be used within a Accordion.Root')
    }

    return context
}
