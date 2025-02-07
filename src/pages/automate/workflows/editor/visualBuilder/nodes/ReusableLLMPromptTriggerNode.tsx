import {Badge} from '@gorgias/merchant-ui-kit'
import React, {memo} from 'react'
import {NodeProps} from 'reactflow'

import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {ReusableLLMPromptTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import VisualBuilderNode from './VisualBuilderNode'

type Props = VisualBuilderNodeProps & {
    isErrored: boolean
}

const ReusableLLMPromptTriggerNode = memo(
    function ReusableLLMPromptTriggerNode({isErrored, isSelected}: Props) {
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
    }
)

export default function ReusableLLMPromptTriggerNodeWrapper(
    node: NodeProps<ReusableLLMPromptTriggerNodeType['data']>
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <ReusableLLMPromptTriggerNode
            {...commonProps}
            isErrored={!!node.data.errors}
        />
    )
}
