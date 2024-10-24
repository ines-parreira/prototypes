import _noop from 'lodash/noop'
import {createContext, useContext} from 'react'

export type AccordionContextType = {
    expandedItem: string | string[] | null
    toggleItem: (itemId: string) => void
    onHoveredItemChange: (itemId: string | null) => void
}

const AccordionContext = createContext<AccordionContextType>({
    expandedItem: null,
    toggleItem: _noop,
    onHoveredItemChange: _noop,
})

export const useAccordionContext = () => useContext(AccordionContext)

export default AccordionContext
