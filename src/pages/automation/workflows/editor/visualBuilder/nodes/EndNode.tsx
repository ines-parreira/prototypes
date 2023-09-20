import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, NodeProps, Position} from 'reactflow'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {EndNodeType} from 'pages/automation/workflows/models/visualBuilderGraph.types'
import {useWorkflowChannelSupportContext} from 'pages/automation/workflows/hooks/useWorkflowChannelSupport'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automation/workflows/hooks/useVisualBuilderNodeProps'

import EdgeBlock from '../components/EdgeBlock'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    isShopperInputFeatureEnabled: boolean
    withWasThisHelpfulPrompt: boolean
}

const EndNode = memo(function EndNode({
    isShopperInputFeatureEnabled,
    withWasThisHelpfulPrompt,
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
                            {' '}
                            <i className={classNames('material-icons')}>
                                {withWasThisHelpfulPrompt
                                    ? 'thumb_up_alt'
                                    : 'forum'}
                            </i>
                        </span>
                        {withWasThisHelpfulPrompt
                            ? 'Ask for feedback'
                            : 'Create ticket'}
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
            withWasThisHelpfulPrompt={node.data.withWasThisHelpfulPrompt}
        />
    )
}
