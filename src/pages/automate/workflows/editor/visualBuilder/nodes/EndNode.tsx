import {Badge} from '@gorgias/merchant-ui-kit'
import React, {memo, useMemo} from 'react'
import {NodeProps} from 'reactflow'

import {
    endNodeActionIconByAction,
    endNodeActionLabelByAction,
} from 'pages/automate/workflows/constants'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {EndNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeIconContent from './VisualBuilderNodeIconContent'

type Props = VisualBuilderNodeProps & {
    action: EndNodeType['data']['action']
    actions: EndNodeType['data']['action'][]
}

const EndNode = memo(function EndNode({
    action,
    actions,
    isGreyedOut,
    isSelected,
    edgeProps,
}: Props) {
    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <VisualBuilderNode
                isClickable={actions.length > 1}
                isSelected={isSelected}
                isGreyedOut={isGreyedOut}
                target={false}
                height={74}
            >
                <Badge type={'light'}>end</Badge>
                <VisualBuilderNodeIconContent
                    icon={endNodeActionIconByAction[action]}
                >
                    {endNodeActionLabelByAction[action]}
                </VisualBuilderNodeIconContent>
            </VisualBuilderNode>
        </div>
    )
})

export default function EndNodeWrapper(node: NodeProps<EndNodeType['data']>) {
    const commonProps = useVisualBuilderNodeProps(node)

    const {visualBuilderGraph} = useVisualBuilderContext()

    const triggerNode = visualBuilderGraph.nodes[0]

    const actions = useMemo<EndNodeType['data']['action'][]>(() => {
        switch (triggerNode.type!) {
            case 'llm_prompt_trigger':
            case 'reusable_llm_prompt_trigger':
                return ['end-success', 'end-failure']
            case 'channel_trigger':
                return ['end', 'ask-for-feedback', 'create-ticket']
        }
    }, [triggerNode.type])

    return (
        <EndNode {...commonProps} action={node.data.action} actions={actions} />
    )
}
