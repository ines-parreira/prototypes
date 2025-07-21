import { createContext } from 'react'

import type {
    AccordionProps,
    AccordionValue,
    AccordionValues,
} from '../utils/types'

type AccordionRootContextType = Omit<
    Required<AccordionProps>,
    'children' | 'onValueChange' | 'disabled' | 'value'
> & {
    values: AccordionValues
    handleValueChange: (accordionValue: AccordionValue) => void
    disabled?: boolean
}

export const AccordionRootContext = createContext<
    AccordionRootContextType | undefined
>(undefined)
