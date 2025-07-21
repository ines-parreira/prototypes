import React, { memo } from 'react'

import { NodeProps } from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { HttpRequestNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

type Props = VisualBuilderNodeProps & {
    name: string
    isErrored: boolean
}

const HttpRequestNode = memo(function HttpRequestNode({
    name,
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
                <VisualBuilderActionTag nodeType="http_request" />
                <VisualBuilderNodeContent placeholder="Request name">
                    {name}
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function HttpRequestNodeWrapper(
    node: NodeProps<HttpRequestNodeType['data']>,
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <HttpRequestNode
            {...commonProps}
            name={node.data.name}
            isErrored={!!node.data.errors}
        />
    )
}
