import React, { memo } from 'react'

import type { NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import classNames from 'classnames'

import { LegacyBadge as Badge, LegacyLabel as Label } from '@gorgias/axiom'

import type { VisualBuilderNodeProps } from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { useVisualBuilderNodeProps } from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import type { ChannelTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    label: string
}

const ChannelTriggerNode = memo(function ChannelTriggerNode({ label }: Props) {
    return (
        <div>
            <div className={css.node} style={{ height: 98 }}>
                <Handle
                    type="target"
                    position={Position.Top}
                    className={css.sourceHandle}
                />
                <div className={css.nodeContainer}>
                    <div className={'w-100'}>
                        <Badge type={'light'}>start</Badge>
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
    node: NodeProps<ChannelTriggerNodeType>,
) {
    const label = node.data.label
    const commonProps = useVisualBuilderNodeProps(node)

    return <ChannelTriggerNode {...commonProps} label={label} />
}
