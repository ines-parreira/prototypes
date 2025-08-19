import React, { memo } from 'react'

import { NodeProps } from '@xyflow/react'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { ReplaceItemNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import { defaultNodeNames } from './constants'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

type Props = VisualBuilderNodeProps & {
    isErrored: boolean
}

const ReplaceItemNode = memo(function ReplaceItemNode({
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
                <VisualBuilderActionTag nodeType="replace_item" />
                <VisualBuilderNodeContent>
                    {defaultNodeNames['replace-item']}
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function ReplaceItemNodeWrapper(
    node: NodeProps<ReplaceItemNodeType>,
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return <ReplaceItemNode {...commonProps} isErrored={!!node.data.errors} />
}
