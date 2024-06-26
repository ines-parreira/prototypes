import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, NodeProps, Position} from 'reactflow'
import {Label} from '@gorgias/ui-kit'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {ShopperAuthenticationNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import NodeDeleteIcon from '../components/NodeDeleteIcon'
import EdgeBlock from '../components/EdgeBlock'

import css from './Node.less'

const ShopperAuthenticationNode = memo(function ShopperAuthenticationNode({
    isSelected,
    isGreyedOut,
    edgeProps,
    deleteProps,
}: VisualBuilderNodeProps) {
    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <div
                className={classNames(
                    css.node,
                    {
                        [css.nodeGreyedOut]: isGreyedOut,
                        [css.nodeSelected]: isSelected,
                    },
                    css.shopperAuthenticationNode
                )}
            >
                <Handle
                    type="target"
                    position={Position.Top}
                    className={css.sourceHandle}
                />
                <div className={css.nodeContainer}>
                    <VisualBuilderActionTag nodeType="shopper_authentication" />
                    <Label className={css.nodeGreyTitle}>
                        <i className="material-icons">check_circle</i>
                        Confirm customer identity
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

export default function ShopperAuthenticationNodeWrapper(
    node: NodeProps<ShopperAuthenticationNodeType['data']>
) {
    const commonProps = useVisualBuilderNodeProps(node)

    return <ShopperAuthenticationNode {...commonProps} />
}
