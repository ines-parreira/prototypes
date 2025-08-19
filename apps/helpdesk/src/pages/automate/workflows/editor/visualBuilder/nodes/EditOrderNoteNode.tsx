import React, { memo } from 'react'

import { NodeProps } from '@xyflow/react'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { EditOrderNoteNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import { defaultNodeNames } from './constants'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

type Props = VisualBuilderNodeProps

const EditOrderNoteNode = memo(function EditOrderNoteNode({
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
                <VisualBuilderActionTag nodeType="edit_order_note" />
                <VisualBuilderNodeContent>
                    {defaultNodeNames['edit-order-note']}
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function EditOrderNoteNodeWrapper(
    node: NodeProps<EditOrderNoteNodeType>,
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return <EditOrderNoteNode {...commonProps} />
}
