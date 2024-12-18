import React, {ReactNode} from 'react'

import {
    ReusableLLMPromptCallNodeType,
    VisualBuilderNode,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import {labelByVisualBuilderNodeType} from '../../constants'
import EditorDrawerHeader from './EditorDrawerHeader'
import {useNodeEditorDrawerContext} from './NodeEditorDrawerContext'

type Props = {
    nodeInEdition?: Exclude<VisualBuilderNode, ReusableLLMPromptCallNodeType>
    label?: string
    children?: ReactNode
}

const NodeEditorDrawerHeader = ({nodeInEdition, label, children}: Props) => {
    const {onClose} = useNodeEditorDrawerContext()

    return (
        <EditorDrawerHeader
            label={
                label ??
                (nodeInEdition?.type &&
                    labelByVisualBuilderNodeType[nodeInEdition.type])
            }
            onClose={onClose}
            testId="node-editor"
        >
            {children}
        </EditorDrawerHeader>
    )
}

export default NodeEditorDrawerHeader
