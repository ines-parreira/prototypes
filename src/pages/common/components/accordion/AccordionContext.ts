import {createContext, useContext} from 'react'
import _noop from 'lodash/noop'

export type AccordionContextType = {
    expandedItem: string | false
    toggleItem: (itemId: string) => void
}

const AccordionContext = createContext<AccordionContextType>({
    expandedItem: false,
    toggleItem: _noop,
})

export const useAccordionContext = () => useContext(AccordionContext)

export default AccordionContext
