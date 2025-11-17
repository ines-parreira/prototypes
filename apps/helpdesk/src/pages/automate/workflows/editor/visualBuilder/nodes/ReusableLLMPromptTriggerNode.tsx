import React, { memo } from 'react'

import type { NodeProps } from '@xyflow/react'

import { Badge } from '@gorgias/axiom'

import type { VisualBuilderNodeProps } from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { useVisualBuilderNodeProps } from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import type { ReusableLLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import VisualBuilderNode from './VisualBuilderNode'

type Props = VisualBuilderNodeProps & {
    isErrored: boolean
}

const ReusableLLMPromptTriggerNode = memo(
    function ReusableLLMPromptTriggerNode({ isErrored, isSelected }: Props) {
        return (
            <VisualBuilderNode
                isClickable
                isSelected={isSelected}
                isErrored={isErrored}
                height={48}
                source={false}
            >
                <Badge type={'light'}>start</Badge>
            </VisualBuilderNode>
        )
    },
)

export default function ReusableLLMPromptTriggerNodeWrapper(
    node: NodeProps<ReusableLLMPromptTriggerNodeType>,
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <ReusableLLMPromptTriggerNode
            {...commonProps}
            isErrored={!!node.data.errors}
        />
    )
}
