import React, { memo } from 'react'

import { NodeProps } from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { RefundOrderNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import { defaultNodeNames } from './constants'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

type Props = VisualBuilderNodeProps

const RefundOrderNode = memo(function RefundOrderNode({
    isSelected,
    isGreyedOut,
    edgeProps,
    deleteProps,
}: Props) {
    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <VisualBuilderNode
                isClickable={false}
                isSelected={isSelected}
                isGreyedOut={isGreyedOut}
            >
                <VisualBuilderActionTag nodeType="refund_order" />
                <VisualBuilderNodeContent>
                    {defaultNodeNames['refund-order']}
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function RefundOrderNodeWrapper(
    node: NodeProps<RefundOrderNodeType['data']>,
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return <RefundOrderNode {...commonProps} />
}
