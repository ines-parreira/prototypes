import React, { memo } from 'react'

import { NodeProps } from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { workflowVariableRegex } from 'pages/automate/workflows/models/variables.model'
import { TextReplyNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

type Props = VisualBuilderNodeProps & {
    contentText: string
    isErrored: boolean
}

const TextReplyNode = memo(function TextReplyNode({
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
                <VisualBuilderActionTag nodeType="text_reply" />
                <VisualBuilderNodeContent placeholder="Message">
                    {contentText.replace(workflowVariableRegex, '{...}')}
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function TextReplyNodeWrapper(
    node: NodeProps<TextReplyNodeType['data']>,
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <TextReplyNode
            {...commonProps}
            contentText={node.data.content.text}
            isErrored={!!node.data.errors}
        />
    )
}
