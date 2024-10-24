import React, {ReactNode} from 'react'

import {VisualBuilderNode} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import {labelByVisualBuilderNodeType} from '../../constants'
import EditorDrawerHeader from './EditorDrawerHeader'
import {useNodeEditorDrawerContext} from './NodeEditorDrawerContext'

type Props = {
    nodeInEdition?: VisualBuilderNode
    label?: string
    children?: ReactNode
}

const NodeEditorDrawerHeader = ({nodeInEdition, children}: Props) => {
    const {onClose} = useNodeEditorDrawerContext()

    return (
        <EditorDrawerHeader
            label={
                nodeInEdition?.type &&
                labelByVisualBuilderNodeType[nodeInEdition.type]
            }
            onClose={onClose}
            testId="node-editor"
        >
            {children}
        </EditorDrawerHeader>
    )
}

export default NodeEditorDrawerHeader
