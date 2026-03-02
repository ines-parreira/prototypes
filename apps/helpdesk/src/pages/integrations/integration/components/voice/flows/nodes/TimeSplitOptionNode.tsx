import { useNodesData } from '@xyflow/react'

import { TimeSplitConditionalRuleType } from '@gorgias/helpdesk-types'

import type { NodeProps } from 'core/ui/flows'
import { ActionLabel, NodeWrapper } from 'core/ui/flows'

import type { TimeSplitOptionNode } from '../types'

type TimeSplitOptionNodeProps = NodeProps<TimeSplitOptionNode>

export function TimeSplitOptionNode(props: TimeSplitOptionNodeProps) {
    const parentStep = useNodesData(props.data.parentId)

    const isCustomHours =
        parentStep?.data.rule_type === TimeSplitConditionalRuleType.CustomHours
    const insideTimeframe = parentStep?.data.on_true_step_id === props.id

    return (
        <NodeWrapper {...props}>
            <ActionLabel
                label={`${insideTimeframe ? 'Inside' : 'Outside'} ${isCustomHours ? 'custom' : 'business'} hours`}
            />
        </NodeWrapper>
    )
}
