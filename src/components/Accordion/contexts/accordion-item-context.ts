import { createContext } from 'react'

import type { AccordionValue } from '../utils/types'

type AccordionItemContextType = {
    isOpen: boolean
    value: AccordionValue
    disabled?: boolean
}

export const AccordionItemContext = createContext<
    AccordionItemContextType | undefined
>(undefined)
