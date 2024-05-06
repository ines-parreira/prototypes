import React, {ReactNode} from 'react'

import {VisualBuilderNode} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import {labelByVisualBuilderNodeType} from '../../constants'
import {useNodeEditorDrawerContext} from './NodeEditorDrawerContext'

import EditorDrawerHeader from './EditorDrawerHeader'

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
        >
            {children}
        </EditorDrawerHeader>
    )
}

export default NodeEditorDrawerHeader
