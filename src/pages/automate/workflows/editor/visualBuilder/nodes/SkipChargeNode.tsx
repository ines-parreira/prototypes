import React, {memo} from 'react'
import {NodeProps} from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {SkipChargeNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import {defaultNodeNames} from './constants'
import VisualBuilderNode from './VisualBuilderNode'
import VisualBuilderNodeContent from './VisualBuilderNodeContent'

type Props = VisualBuilderNodeProps & {
    isErrored: boolean
}

const SkipChargeNode = memo(function SkipChargeNode({
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
                <VisualBuilderActionTag nodeType="skip_charge" />
                <VisualBuilderNodeContent>
                    {defaultNodeNames['skip-charge']}
                </VisualBuilderNodeContent>
                <NodeDeleteIcon {...deleteProps} />
            </VisualBuilderNode>
        </div>
    )
})

export default function SkipChargeNodeWrapper(
    node: NodeProps<SkipChargeNodeType['data']>
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return <SkipChargeNode {...commonProps} isErrored={!!node.data.errors} />
}
