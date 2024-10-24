import {Label} from '@gorgias/ui-kit'
import classNames from 'classnames'
import React, {memo, useMemo} from 'react'
import {Handle, NodeProps, Position} from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {isValidLiquidSyntaxInNode} from 'pages/automate/workflows/models/variables.model'
import {RemoveItemNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    isErrored: boolean
}

const RemoveItemNode = memo(function RemoveItemNode({
    isSelected,
    shouldShowErrors,
    isErrored,
    isGreyedOut,
    edgeProps,
    deleteProps,
}: Props) {
    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <div
                className={classNames(css.node, {
                    [css.nodeErrored]: shouldShowErrors && isErrored,
                    [css.nodeGreyedOut]: isGreyedOut,
                    [css.nodeSelected]: isSelected,
                })}
            >
                <Handle
                    type="target"
                    position={Position.Top}
                    className={css.sourceHandle}
                />
                <div className={css.nodeContainer}>
                    <VisualBuilderActionTag nodeType="remove_item" />
                    <Label className={css.nodeTitle}>Remove item.</Label>
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

export default function RemoveItemNodeWrapper(
    node: NodeProps<RemoveItemNodeType['data']>
) {
    const {checkInvalidVariablesForNode} = useVisualBuilderContext()
    const hasInvalidVariables = useMemo(
        () =>
            checkInvalidVariablesForNode({
                id: node.id,
                data: node.data,
                type: 'remove_item',
            }),
        [node.id, node.data, checkInvalidVariablesForNode]
    )
    const isErrored =
        !node.data.productVariantId ||
        !node.data.quantity ||
        hasInvalidVariables ||
        !isValidLiquidSyntaxInNode({
            data: node.data,
            type: 'remove_item',
        })
    const commonProps = useVisualBuilderNodeProps(node)

    return <RemoveItemNode {...commonProps} isErrored={isErrored} />
}
