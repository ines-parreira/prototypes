import React, { memo } from 'react'

import { NodeProps } from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { ConditionsNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

type Props = VisualBuilderNodeProps & {
    isErrored: boolean
    name: string
}

const ConditionsNode = memo(function ConditionsNode({
    name,
    isErrored,
    isGreyedOut,
    isSelected,
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
                <VisualBuilderActionTag nodeType="conditions" />
                <VisualBuilderNodeContent placeholder="Route customers using variables">
                    {name}
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function ConditionsNodeWrapper(
    node: NodeProps<ConditionsNodeType['data']>,
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <ConditionsNode
            {...commonProps}
            name={node.data.name}
            isErrored={!!node.data.errors}
        />
    )
}
