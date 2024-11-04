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
import {UpdateShippingAddressNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    isErrored: boolean
}

const UpdateShippingAddressNode = memo(function UpdateShippingAddressNode({
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
                    <VisualBuilderActionTag nodeType="update_shipping_address" />
                    <Label className={css.nodeTitle}>
                        Edit order shipping address.
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

export default function UpdateShippingAddressNodeWrapper(
    node: NodeProps<UpdateShippingAddressNodeType['data']>
) {
    const {checkInvalidVariablesForNode} = useVisualBuilderContext()
    const hasInvalidVariables = useMemo(
        () =>
            checkInvalidVariablesForNode({
                id: node.id,
                data: node.data,
                type: 'update_shipping_address',
            }),
        [node.id, node.data, checkInvalidVariablesForNode]
    )
    const isErrored =
        !node.data.name ||
        !node.data.address1 ||
        !node.data.address2 ||
        !node.data.city ||
        !node.data.zip ||
        !node.data.province ||
        !node.data.country ||
        !node.data.phone ||
        !node.data.lastName ||
        !node.data.firstName ||
        hasInvalidVariables ||
        !isValidLiquidSyntaxInNode({
            data: node.data,
            type: 'update_shipping_address',
        })
    const commonProps = useVisualBuilderNodeProps(node)

    return <UpdateShippingAddressNode {...commonProps} isErrored={isErrored} />
}
