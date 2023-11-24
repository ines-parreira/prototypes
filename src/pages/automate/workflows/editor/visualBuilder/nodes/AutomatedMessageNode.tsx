import classNames from 'classnames'
import React, {memo, useMemo} from 'react'
import {Handle, Position, NodeProps} from 'reactflow'

import Label from 'pages/common/forms/Label/Label'
import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {
    flowVariableRegex,
    isValidLiquidSyntaxInNode,
} from 'pages/automate/workflows/models/variables.model'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'

import {AutomatedMessageNodeType} from '../../../models/visualBuilderGraph.types'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import EdgeBlock from '../components/EdgeBlock'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    contentText: string
    isErrored: boolean
}

const AutomatedMessageNode = memo(function AutomatedMessageNode({
    contentText,
    isErrored,
    shouldShowErrors,
    isGreyedOut,
    isSelected,
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
                    <VisualBuilderActionTag nodeType="automated_message" />
                    <Label className={css.nodeTitle}>
                        {contentText.length > 0 ? (
                            contentText.replace(flowVariableRegex, '{...}')
                        ) : (
                            <span className={css.clickToAdd}>Message</span>
                        )}
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

export default function AutomatedMessageNodeWrapper(
    node: NodeProps<AutomatedMessageNodeType['data']>
) {
    const {content} = node.data
    const {checkInvalidVariablesForNode} = useWorkflowEditorContext()

    const hasInvalidVariables = useMemo(
        () => checkInvalidVariablesForNode(content.text, node.id),
        [content.text, node.id, checkInvalidVariablesForNode]
    )

    const isErrored =
        content.text.length === 0 ||
        hasInvalidVariables ||
        !isValidLiquidSyntaxInNode(node.data.content)
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <AutomatedMessageNode
            {...commonProps}
            shouldShowErrors={
                commonProps.shouldShowErrors || hasInvalidVariables
            }
            contentText={content.text}
            isErrored={isErrored}
        />
    )
}
