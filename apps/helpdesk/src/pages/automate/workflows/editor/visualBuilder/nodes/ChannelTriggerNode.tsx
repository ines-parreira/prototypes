import React, { memo } from 'react'

import type { NodeProps } from '@xyflow/react'

import { LegacyBadge as Badge } from '@gorgias/axiom'

import type { VisualBuilderNodeProps } from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { useVisualBuilderNodeProps } from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import type { ChannelTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

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
    node: NodeProps<ChannelTriggerNodeType>,
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
