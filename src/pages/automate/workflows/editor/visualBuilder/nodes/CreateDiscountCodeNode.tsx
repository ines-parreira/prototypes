import React, {memo} from 'react'
import {NodeProps} from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {CreateDiscountCodeNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

const CreateDiscountCodeNode = memo(function CreateDiscountCodeNode({
    isSelected,
    isGreyedOut,
    edgeProps,
    deleteProps,
}: VisualBuilderNodeProps) {
    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <VisualBuilderNode
                isClickable={false}
                isSelected={isSelected}
                isGreyedOut={isGreyedOut}
            >
                <VisualBuilderActionTag nodeType="create_discount_code" />
                <VisualBuilderNodeContent>
                    Create discount code.
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function CreateDiscountCodeNodeWrapper(
    node: NodeProps<CreateDiscountCodeNodeType['data']>
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return <CreateDiscountCodeNode {...commonProps} />
}
