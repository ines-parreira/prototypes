import React, { memo } from 'react'

import { NodeProps } from '@xyflow/react'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { workflowVariableRegex } from 'pages/automate/workflows/models/variables.model'
import { OrderLineItemSelectionNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

type Props = VisualBuilderNodeProps & {
    contentText: string
    isErrored: boolean
}

const OrderLineItemSelectionNode = memo(function OrderLineItemSelectionNode({
    contentText,
    isErrored,
    isGreyedOut,
    isSelected,
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
                <VisualBuilderActionTag nodeType="order_line_item_selection" />
                <VisualBuilderNodeContent placeholder="Message">
                    {contentText.replace(workflowVariableRegex, '{...}')}
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function OrderLineItemSelectionNodeWrapper(
    node: NodeProps<OrderLineItemSelectionNodeType>,
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <OrderLineItemSelectionNode
            {...commonProps}
            contentText={node.data.content.text}
            isErrored={!!node.data.errors}
        />
    )
}
