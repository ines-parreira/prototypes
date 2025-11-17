import React, { memo } from 'react'

import type { NodeProps } from '@xyflow/react'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import type { VisualBuilderNodeProps } from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { useVisualBuilderNodeProps } from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import type { CreateDiscountCodeNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import { defaultNodeNames } from './constants'
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
                    {defaultNodeNames['create-discount-code']}
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function CreateDiscountCodeNodeWrapper(
    node: NodeProps<CreateDiscountCodeNodeType>,
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return <CreateDiscountCodeNode {...commonProps} />
}
