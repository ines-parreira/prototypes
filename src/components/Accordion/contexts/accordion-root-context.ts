import { createContext } from 'react'

import { AccordionProps } from '../utils/types'

type AccordionRootContextType = Omit<
    Required<AccordionProps>,
    'children' | 'onValueChange' | 'disabled'
> & {
    handleValueChange: (accordionValue: string) => void
    disabled?: boolean
}

export const AccordionRootContext = createContext<
    AccordionRootContextType | undefined
>(undefined)
