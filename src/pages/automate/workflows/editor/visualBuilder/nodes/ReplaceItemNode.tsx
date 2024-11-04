import {Label} from '@gorgias/merchant-ui-kit'
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
import {ReplaceItemNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    isErrored: boolean
}

const ReplaceItemNode = memo(function ReplaceItemNode({
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
                    <VisualBuilderActionTag nodeType="replace_item" />
                    <Label className={css.nodeTitle}>Replace item.</Label>
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

export default function ReplaceItemNodeWrapper(
    node: NodeProps<ReplaceItemNodeType['data']>
) {
    const {checkInvalidVariablesForNode} = useVisualBuilderContext()
    const hasInvalidVariables = useMemo(
        () =>
            checkInvalidVariablesForNode({
                id: node.id,
                data: node.data,
                type: 'replace_item',
            }),
        [node.id, node.data, checkInvalidVariablesForNode]
    )
    const isErrored =
        !node.data.productVariantId ||
        !node.data.quantity ||
        !node.data.addedProductVariantId ||
        !node.data.addedQuantity ||
        hasInvalidVariables ||
        !isValidLiquidSyntaxInNode({
            data: node.data,
            type: 'replace_item',
        })
    const commonProps = useVisualBuilderNodeProps(node)

    return <ReplaceItemNode {...commonProps} isErrored={isErrored} />
}
