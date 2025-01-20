import React, {memo} from 'react'
import {NodeProps} from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {ReshipForFreeNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import {defaultNodeNames} from './constants'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

type Props = VisualBuilderNodeProps

const ReshipForFreeNode = memo(function ReshipForFreeNode({
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
                <VisualBuilderActionTag nodeType="reship_for_free" />
                <VisualBuilderNodeContent>
                    {defaultNodeNames['reship-for-free']}
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function ReshipForFreeNodeWrapper(
    node: NodeProps<ReshipForFreeNodeType['data']>
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return <ReshipForFreeNode {...commonProps} />
}
