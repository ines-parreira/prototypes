import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, Position, NodeProps} from 'reactflow'
import {Label} from '@gorgias/ui-kit'

import {ChannelTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    label: string
}

const ChannelTriggerNode = memo(function ChannelTriggerNode({label}: Props) {
    return (
        <div>
            <div className={css.node} style={{height: 98}}>
                <Handle
                    type="target"
                    position={Position.Top}
                    className={css.sourceHandle}
                />
                <div className={css.nodeContainer}>
                    <div className={'w-100'}>
                        <Badge type={ColorType.Light}>start flow</Badge>
                    </div>
                    <Label className={css.nodeTitle}>{label}</Label>
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

export default function TriggerButtonNodeWrapper(
    node: NodeProps<ChannelTriggerNodeType['data']>
) {
    const label = node.data.label
    const commonProps = useVisualBuilderNodeProps(node)

    return <ChannelTriggerNode {...commonProps} label={label} />
}
