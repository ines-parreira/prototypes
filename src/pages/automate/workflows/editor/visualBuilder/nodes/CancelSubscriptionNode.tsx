import classNames from 'classnames'
import React, {memo, useMemo} from 'react'
import {Handle, NodeProps, Position} from 'reactflow'
import {Label} from '@gorgias/ui-kit'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {CancelSubscriptionNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {isValidLiquidSyntaxInNode} from 'pages/automate/workflows/models/variables.model'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'

import NodeDeleteIcon from '../components/NodeDeleteIcon'
import EdgeBlock from '../components/EdgeBlock'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    isErrored: boolean
}

const CancelSubscriptionNode = memo(function CancelSubscriptionNode({
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
                    <VisualBuilderActionTag nodeType="cancel_subscription" />
                    <Label className={css.nodeTitle}>
                        Cancel active subscription.
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

export default function CancelSubscriptionNodeWrapper(
    node: NodeProps<CancelSubscriptionNodeType['data']>
) {
    const {checkInvalidVariablesForNode} = useVisualBuilderContext()
    const hasInvalidVariables = useMemo(
        () =>
            checkInvalidVariablesForNode({
                id: node.id,
                data: node.data,
                type: 'cancel_subscription',
            }),
        [node.id, node.data, checkInvalidVariablesForNode]
    )
    const isErrored =
        !node.data.subscriptionId ||
        !node.data.reason ||
        hasInvalidVariables ||
        !isValidLiquidSyntaxInNode({
            data: node.data,
            type: 'cancel_subscription',
        })
    const commonProps = useVisualBuilderNodeProps(node)

    return <CancelSubscriptionNode {...commonProps} isErrored={isErrored} />
}
