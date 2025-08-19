import React, { memo } from 'react'

import { NodeProps } from '@xyflow/react'

import useSplitLLMPromptTriggerInputs from 'pages/automate/workflows/hooks/useSplitLLMPromptTriggerInputs'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { LLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import LLMPromptTriggerNodeBadge from './LLMPromptTriggerNodeBadge'
import LLMPromptTriggerNodeLabel from './LLMPromptTriggerNodeLabel'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeIconContent from './VisualBuilderNodeIconContent'

type Props = VisualBuilderNodeProps & {
    isErrored: boolean
    inputs: LLMPromptTriggerNodeType['data']['inputs']
}

const LLMPromptTriggerNode = memo(function LLMPromptTriggerNode({
    isErrored,
    isSelected,
    inputs,
}: Props) {
    const hasInputs = !!inputs.length

    return (
        <VisualBuilderNode
            isClickable
            isSelected={isSelected}
            isErrored={isErrored}
            height={88}
            source={false}
        >
            <LLMPromptTriggerNodeLabel isFilled={hasInputs} />
            <VisualBuilderNodeIconContent icon={hasInputs ? 'edit' : undefined}>
                {hasInputs
                    ? 'Edit custom variables'
                    : 'Ask customers for information to use as variables in HTTP requests or conditions'}
            </VisualBuilderNodeIconContent>
            <LLMPromptTriggerNodeBadge />
        </VisualBuilderNode>
    )
})

export default function LLMPromptTriggerNodeWrapper(
    node: NodeProps<LLMPromptTriggerNodeType>,
) {
    const { visualBuilderGraph } = useVisualBuilderContext()

    const commonProps = useVisualBuilderNodeProps(node)

    const [inputs] = useSplitLLMPromptTriggerInputs(
        node.data.inputs,
        visualBuilderGraph.nodes,
    )

    return (
        <LLMPromptTriggerNode
            {...commonProps}
            isErrored={!!node.data.errors?.inputs}
            inputs={inputs}
        />
    )
}
