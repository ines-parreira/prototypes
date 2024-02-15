import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, NodeProps, Position} from 'reactflow'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {EndNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {useWorkflowChannelSupportContext} from 'pages/automate/workflows/hooks/useWorkflowChannelSupport'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {
    endNodeActionIconByAction,
    endNodeActionLabelByAction,
} from 'pages/automate/workflows/constants'

import EdgeBlock from '../components/EdgeBlock'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    isShopperInputFeatureEnabled: boolean
    action: EndNodeType['data']['action']
}

const EndNode = memo(function EndNode({
    isShopperInputFeatureEnabled,
    action,
    isGreyedOut,
    isSelected,
    edgeProps,
}: Props) {
    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <div
                className={classNames(css.node, css.endNode, {
                    [css.nodeGreyedOut]: isGreyedOut,
                    [css.nodeSelected]: isSelected,
                    [css.notClickable]: !isShopperInputFeatureEnabled,
                })}
                onClick={(e) => {
                    if (!isShopperInputFeatureEnabled) {
                        e.stopPropagation()
                    }
                }}
            >
                <div className={'w-100'}>
                    <Badge type={ColorType.Light}>end flow</Badge>
                </div>
                <div className={css.nodeTitle}>
                    <div>
                        <span className={css.iconContainer}>
                            <i className={classNames('material-icons')}>
                                {endNodeActionIconByAction[action]}
                            </i>
                        </span>
                        {endNodeActionLabelByAction[action]}
                    </div>
                </div>
                <Handle
                    type="target"
                    position={Position.Top}
                    className={classNames(css.sourceHandle)}
                />
            </div>
        </div>
    )
})

export default function EndNodeWrapper(node: NodeProps<EndNodeType['data']>) {
    const {getSupportedChannels} = useWorkflowChannelSupportContext()
    const isShopperInputFeatureEnabled =
        getSupportedChannels('text_reply').length > 0
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <EndNode
            {...commonProps}
            isShopperInputFeatureEnabled={isShopperInputFeatureEnabled}
            action={node.data.action}
        />
    )
}
