import { createContext, useContext } from 'react'
import { noop } from '@gorgias/toolkit'

export type AccordionContextType = {
    expandedItem: string | string[] | null
    toggleItem: (itemId: string) => void
    onHoveredItemChange: (itemId: string | null) => void
}

const AccordionContext = createContext<AccordionContextType>({
    expandedItem: null,
    toggleItem: noop,
    onHoveredItemChange: noop,
})

export const useAccordionContext = () => useContext(AccordionContext)

export { AccordionContext }
