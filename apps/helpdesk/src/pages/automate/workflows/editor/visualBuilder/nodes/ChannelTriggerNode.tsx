import React, { memo } from 'react'

import { NodeProps } from 'reactflow'

import { Badge } from '@gorgias/axiom'

import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { ChannelTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

type Props = VisualBuilderNodeProps & {
    label: string
    isErrored: boolean
}

const ChannelTriggerNode = memo(function ChannelTriggerNode({
    label,
    isErrored,
    isSelected,
}: Props) {
    return (
        <VisualBuilderNode
            isClickable
            isSelected={isSelected}
            isErrored={isErrored}
            height={98}
            source={false}
        >
            <Badge type={'light'}>start</Badge>
            <VisualBuilderNodeContent placeholder="Trigger button">
                {label}
            </VisualBuilderNodeContent>
        </VisualBuilderNode>
    )
})

export default function ChannelTriggerNodeWrapper(
    node: NodeProps<ChannelTriggerNodeType['data']>,
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <ChannelTriggerNode
            {...commonProps}
            label={node.data.label}
            isErrored={!!node.data.errors}
        />
    )
}
