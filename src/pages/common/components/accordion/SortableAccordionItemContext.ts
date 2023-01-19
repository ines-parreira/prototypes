import {createContext, RefObject, useContext} from 'react'

export type SortableAccordionItemContextType = {
    dragRef: RefObject<HTMLDivElement> | null
}

const SortableAccordionItemContext =
    createContext<SortableAccordionItemContextType>({
        dragRef: null,
    })

export const useSortableAccordionItemContext = () =>
    useContext(SortableAccordionItemContext)

export default SortableAccordionItemContext
