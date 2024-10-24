import {Label} from '@gorgias/ui-kit'
import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, NodeProps, Position} from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {CreateDiscountCodeNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'

import css from './Node.less'

const CreateDiscountCodeNode = memo(function CreateDiscountCodeNode({
    isSelected,
    isGreyedOut,
    edgeProps,
    deleteProps,
}: VisualBuilderNodeProps) {
    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <div
                className={classNames(css.node, {
                    [css.nodeGreyedOut]: isGreyedOut,
                    [css.nodeSelected]: isSelected,
                })}
                onClick={(event) => {
                    event.stopPropagation()
                }}
            >
                <Handle
                    type="target"
                    position={Position.Top}
                    className={css.sourceHandle}
                />
                <div className={css.nodeContainer}>
                    <VisualBuilderActionTag nodeType="create_discount_code" />
                    <Label className={css.nodeTitle}>
                        Create discount code.
                    </Label>
                    <NodeDeleteIcon {...deleteProps} />
                </div>
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className={classNames(css.targetHandle)}
                />
            </div>
        </div>
    )
})

export default function CreateDiscountCodeNodeWrapper(
    node: NodeProps<CreateDiscountCodeNodeType['data']>
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return <CreateDiscountCodeNode {...commonProps} />
}
