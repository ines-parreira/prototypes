import _noop from 'lodash/noop'
import {createContext, useContext} from 'react'

export type NodeEditorDrawerContextType = {
    onClose: () => void
}

const NodeEditorDrawerContext = createContext<NodeEditorDrawerContextType>({
    onClose: _noop,
})

export const useNodeEditorDrawerContext = () =>
    useContext(NodeEditorDrawerContext)

export default NodeEditorDrawerContext
