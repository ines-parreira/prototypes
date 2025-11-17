import React, { memo } from 'react'

import type { NodeProps } from '@xyflow/react'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import type { VisualBuilderNodeProps } from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { useVisualBuilderNodeProps } from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { workflowVariableRegex } from 'pages/automate/workflows/models/variables.model'
import type { FileUploadNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

type Props = VisualBuilderNodeProps & {
    contentText: string
    isErrored: boolean
}

const FileUploadNode = memo(function FileUploadNode({
    contentText,
    isErrored,
    isSelected,
    isGreyedOut,
    edgeProps,
    deleteProps,
}: Props) {
    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <VisualBuilderNode
                isClickable
                isSelected={isSelected}
                isErrored={isErrored}
                isGreyedOut={isGreyedOut}
            >
                <VisualBuilderActionTag nodeType="file_upload" />
                <VisualBuilderNodeContent placeholder="Message">
                    {contentText.replace(workflowVariableRegex, '{...}')}
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function FileUploadNodeWrapper(
    node: NodeProps<FileUploadNodeType>,
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <FileUploadNode
            {...commonProps}
            contentText={node.data.content.text}
            isErrored={!!node.data.errors}
        />
    )
}
