import {Label} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React, {memo, useMemo} from 'react'
import {Handle, NodeProps, Position} from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {
    workflowVariableRegex,
    isValidLiquidSyntaxInNode,
} from 'pages/automate/workflows/models/variables.model'

import {MultipleChoicesNodeType} from '../../../../models/visualBuilderGraph.types'
import EdgeBlock from '../../components/EdgeBlock'
import NodeDeleteIcon from '../../components/NodeDeleteIcon'

import css from '../Node.less'

type Props = VisualBuilderNodeProps & {
    contentText: string
    isErrored: boolean
}

const MultipleChoicesNode = memo(function MultipleChoicesNode({
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
                    <VisualBuilderActionTag nodeType="multiple_choices" />
                    <Label className={css.nodeTitle}>
                        {contentText.length > 0 ? (
                            contentText.replace(workflowVariableRegex, '{...}')
                        ) : (
                            <span className={css.clickToAdd}>Question</span>
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

export default function MultipleChoicesNodeWrapper(
    node: NodeProps<MultipleChoicesNodeType['data']>
) {
    const {content, choices} = node.data
    const {checkInvalidVariablesForNode} = useVisualBuilderContext()
    const hasInvalidVariables = useMemo(
        () =>
            checkInvalidVariablesForNode({
                id: node.id,
                data: node.data,
                type: 'multiple_choices',
            }),
        [node.id, node.data, checkInvalidVariablesForNode]
    )
    const isErrored =
        content.text.length === 0 ||
        choices.some((c) => !c.label) ||
        hasInvalidVariables ||
        !isValidLiquidSyntaxInNode({data: node.data, type: 'multiple_choices'})
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <MultipleChoicesNode
            {...commonProps}
            shouldShowErrors={
                commonProps.shouldShowErrors || hasInvalidVariables
            }
            contentText={content.text}
            isErrored={isErrored}
        />
    )
}
