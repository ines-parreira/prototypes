import {createContext, useContext} from 'react'
import _noop from 'lodash/noop'

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
    onMove: _noop,
    onDrop: _noop,
    onCancel: _noop,
})

export const useSortableAccordionContext = () =>
    useContext(SortableAccordionContext)

export default SortableAccordionContext
