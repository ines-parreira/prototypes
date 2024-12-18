import React, {memo} from 'react'
import {NodeProps} from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {ShopperAuthenticationNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'

import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeIconContent from './VisualBuilderNodeIconContent'

const ShopperAuthenticationNode = memo(function ShopperAuthenticationNode({
    isSelected,
    isGreyedOut,
    edgeProps,
    deleteProps,
}: VisualBuilderNodeProps) {
    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <VisualBuilderNode
                isClickable
                isSelected={isSelected}
                isGreyedOut={isGreyedOut}
                height={80}
            >
                <VisualBuilderActionTag nodeType="shopper_authentication" />
                <VisualBuilderNodeIconContent icon="check_circle">
                    Confirm customer identity
                </VisualBuilderNodeIconContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function ShopperAuthenticationNodeWrapper(
    node: NodeProps<ShopperAuthenticationNodeType['data']>
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return <ShopperAuthenticationNode {...commonProps} />
}
