import { createContext, useContext } from 'react'

import _noop from 'lodash/noop'

export type AccordionItemContextType = {
    isExpanded: boolean
    isDisabled: boolean
    toggleItem: () => void
}

const AccordionItemContext = createContext<AccordionItemContextType>({
    isExpanded: false,
    isDisabled: false,
    toggleItem: _noop,
})

export const useAccordionItemContext = () => useContext(AccordionItemContext)

export default AccordionItemContext
