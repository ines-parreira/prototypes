import { createContext } from 'react'

type AccordionItemContextType = {
    isOpen: boolean
    value: string
    disabled?: boolean
}

export const AccordionItemContext = createContext<
    AccordionItemContextType | undefined
>(undefined)
