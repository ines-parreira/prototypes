import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, Position, NodeProps} from 'reactflow'
import {Label} from '@gorgias/ui-kit'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {ChannelTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    label: string
    isErrored: boolean
}

const ChannelTriggerNode = memo(function ChannelTriggerNode({
    label,
    isErrored,
    isSelected,
    shouldShowErrors,
}: Props) {
    return (
        <div>
            <div
                className={classNames(css.node, {
                    [css.nodeErrored]: shouldShowErrors && isErrored,
                    [css.nodeSelected]: isSelected,
                })}
                style={{height: 98}}
            >
                <Handle
                    type="target"
                    position={Position.Top}
                    className={css.sourceHandle}
                />
                <div className={css.nodeContainer}>
                    <div className={'w-100'}>
                        <Badge type={ColorType.Light}>start flow</Badge>
                    </div>
                    <Label className={css.nodeTitle}>
                        {label.length > 0 ? (
                            label
                        ) : (
                            <span className={css.clickToAdd}>
                                Trigger button
                            </span>
                        )}
                    </Label>
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

export default function ChannelTriggerNodeWrapper(
    node: NodeProps<ChannelTriggerNodeType['data']>
) {
    const label = node.data.label
    const isErrored = label.length === 0
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <ChannelTriggerNode
            {...commonProps}
            label={label}
            isErrored={isErrored}
        />
    )
}
