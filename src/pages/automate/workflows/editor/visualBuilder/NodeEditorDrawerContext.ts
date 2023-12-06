import {createContext, useContext} from 'react'
import _noop from 'lodash/noop'

export type NodeEditorDrawerContextType = {
    onClose: () => void
}

const NodeEditorDrawerContext = createContext<NodeEditorDrawerContextType>({
    onClose: _noop,
})

export const useNodeEditorDrawerContext = () =>
    useContext(NodeEditorDrawerContext)

export default NodeEditorDrawerContext
