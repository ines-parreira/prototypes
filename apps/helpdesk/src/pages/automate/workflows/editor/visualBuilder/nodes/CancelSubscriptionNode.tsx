import React, { memo } from 'react'

import { NodeProps } from '@xyflow/react'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { CancelSubscriptionNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import { defaultNodeNames } from './constants'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

type Props = VisualBuilderNodeProps & {
    isErrored: boolean
}

const CancelSubscriptionNode = memo(function CancelSubscriptionNode({
    isSelected,
    isErrored,
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
                <VisualBuilderActionTag nodeType="cancel_subscription" />
                <VisualBuilderNodeContent>
                    {defaultNodeNames['cancel-subscription']}
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function CancelSubscriptionNodeWrapper(
    node: NodeProps<CancelSubscriptionNodeType>,
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <CancelSubscriptionNode
            {...commonProps}
            isErrored={!!node.data.errors}
        />
    )
}
