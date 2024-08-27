import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, Position, NodeProps} from 'reactflow'
import {Label} from '@gorgias/ui-kit'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {LLMPromptTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {validateConditions} from 'pages/automate/workflows/hooks/useWorkflowEditor'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    instructions: string
    isErrored: boolean
}

const LLMPromptTriggerNode = memo(function LLMPromptTriggerNode({
    instructions,
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
                        {instructions.length > 0 ? (
                            instructions
                        ) : (
                            <span className={css.clickToAdd}>
                                Describe what the Action does.
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

export default function LLMPromptTriggerNodeWrapper(
    node: NodeProps<LLMPromptTriggerNodeType['data']>
) {
    const instructions = node.data.instructions
    const isErrored =
        !instructions.trim() ||
        node.data.custom_inputs.some(
            (input) => !input.name.trim() || !input.instructions.trim()
        ) ||
        (node.data.conditionsType !== null &&
            validateConditions(node.data.conditions))
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <LLMPromptTriggerNode
            {...commonProps}
            instructions={instructions}
            isErrored={isErrored}
        />
    )
}
