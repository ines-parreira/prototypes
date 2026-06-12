import { createContext, useContext } from 'react'
import { noop } from '@gorgias/toolkit'

export type NodeEditorDrawerContextType = {
    onClose: () => void
}

const NodeEditorDrawerContext = createContext<NodeEditorDrawerContextType>({
    onClose: noop,
})

export const useNodeEditorDrawerContext = () =>
    useContext(NodeEditorDrawerContext)

export { NodeEditorDrawerContext }
