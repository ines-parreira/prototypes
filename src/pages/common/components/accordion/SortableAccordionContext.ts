import _noop from 'lodash/noop'
import {createContext, useContext} from 'react'

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
