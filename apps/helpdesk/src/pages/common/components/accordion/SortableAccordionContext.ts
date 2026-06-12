import { createContext, useContext } from 'react'
import { noop } from '@gorgias/toolkit'

export type SortableAccordionContextType = {
    type: string
    isDisabled: boolean
    onMove: (dragIndex: number, hoverIndex: number) => void
    onDrop: () => void
    onCancel: () => void
}

const SortableAccordionContext = createContext<SortableAccordionContextType>({
    type: '',
    isDisabled: false,
    onMove: noop,
    onDrop: noop,
    onCancel: noop,
})

export const useSortableAccordionContext = () =>
    useContext(SortableAccordionContext)

export { SortableAccordionContext }
