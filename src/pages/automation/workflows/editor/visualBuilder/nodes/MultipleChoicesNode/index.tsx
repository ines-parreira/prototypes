import classNames from 'classnames'
import React, {useMemo} from 'react'
import {Handle, NodeProps, Position} from 'reactflow'
import _isEqual from 'lodash/isEqual'
import Label from 'pages/common/forms/Label/Label'
import VisualBuilderActionTag from 'pages/automation/workflows/components/VisualBuilderActionTag'
import {useWorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'
import {
    flowVariableRegex,
    isValidLiquidSyntaxInNode,
} from 'pages/automation/workflows/models/variables.model'
import {MultipleChoicesNodeType} from '../../../../models/visualBuilderGraph.types'
import NodeDeleteIcon from '../../components/NodeDeleteIcon'
import EdgeBlock from '../../components/EdgeBlock'

import css from '../Node.less'

function MultipleChoicesNode(node: NodeProps<MultipleChoicesNodeType['data']>) {
    const {content, choices, isGreyedOut} = node.data

    const {
        visualBuilderNodeIdEditing,
        shouldShowErrors,
        checkInvalidVariablesForNode,
    } = useWorkflowEditorContext()
    const hasInvalidVariables = useMemo(
        () => checkInvalidVariablesForNode(content.text, node.id),
        [content.text, node.id, checkInvalidVariablesForNode]
    )
    const isErrored =
        content.text.length === 0 ||
        choices.find((c) => !c.label) ||
        hasInvalidVariables ||
        !isValidLiquidSyntaxInNode(node.data.content)

    const isSelected = visualBuilderNodeIdEditing === node.id

    return (
        <div>
            <EdgeBlock node={node} />
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
                    <VisualBuilderActionTag nodeType="multiple_choices">
                        Multiple choice
                    </VisualBuilderActionTag>
                    <Label className={css.nodeTitle}>
                        {content.text.length > 0 ? (
                            content.text.replace(flowVariableRegex, '{...}')
                        ) : (
                            <span className={css.clickToAdd}>Question</span>
                        )}
                    </Label>
                    <NodeDeleteIcon node={node} />
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

export default React.memo(MultipleChoicesNode, (prevProps, nextProps) =>
    _isEqual(prevProps, nextProps)
)
