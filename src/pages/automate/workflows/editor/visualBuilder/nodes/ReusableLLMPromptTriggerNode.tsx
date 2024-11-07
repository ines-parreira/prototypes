import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, Position, NodeProps} from 'reactflow'

import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {validateConditions} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {ReusableLLMPromptTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    isErrored: boolean
}

const ReusableLLMPromptTriggerNode = memo(
    function ReusableLLMPromptTriggerNode({
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
                    style={{height: 48}}
                >
                    <Handle
                        type="target"
                        position={Position.Top}
                        className={css.sourceHandle}
                    />
                    <div className={css.nodeContainer}>
                        <div className={'w-100'}>
                            <Badge type={ColorType.Light}>start</Badge>
                        </div>
                    </div>
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        className={classNames(css.targetHandle)}
                    />
                </div>
            </div>
        )
    }
)

export default function ReusableLLMPromptTriggerNodeWrapper(
    node: NodeProps<ReusableLLMPromptTriggerNodeType['data']>
) {
    const isErrored =
        node.data.inputs.some(
            (input) => !input.name.trim() || !input.instructions.trim()
        ) ||
        (node.data.conditionsType !== null &&
            validateConditions(node.data.conditions))
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <ReusableLLMPromptTriggerNode {...commonProps} isErrored={isErrored} />
    )
}
