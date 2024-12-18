import React, {memo} from 'react'
import {NodeProps} from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {RefundShippingCostsNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

type Props = VisualBuilderNodeProps

const RefundShippingCostsNode = memo(function RefundShippingCostsNode({
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
                <VisualBuilderActionTag nodeType="refund_shipping_costs" />
                <VisualBuilderNodeContent>
                    Refund shipping costs.
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function RefundShippingCostsNodeWrapper(
    node: NodeProps<RefundShippingCostsNodeType['data']>
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return <RefundShippingCostsNode {...commonProps} />
}
