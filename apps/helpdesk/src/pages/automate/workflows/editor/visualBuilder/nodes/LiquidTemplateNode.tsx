import React, { memo } from 'react'

import { NodeProps } from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { LiquidTemplateNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

type Props = VisualBuilderNodeProps & {
    name: string
    isErrored: boolean
}

const LiquidTemplateNode = memo(function LiquidTemplateNode({
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
                <VisualBuilderActionTag nodeType="liquid_template" />
                <VisualBuilderNodeContent placeholder="Liquid template">
                    {name}
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function LiquidTemplateNodeWrapper(
    node: NodeProps<LiquidTemplateNodeType['data']>,
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <LiquidTemplateNode
            {...commonProps}
            name={node.data.name}
            isErrored={!!node.data.errors}
        />
    )
}
