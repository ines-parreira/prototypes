import classNames from 'classnames'
import React from 'react'
import {Handle, Position, NodeProps} from 'reactflow'
import _isEqual from 'lodash/isEqual'

import Label from 'pages/common/forms/Label/Label'
import VisualBuilderActionTag from 'pages/automation/workflows/components/VisualBuilderActionTag'
import {useWorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'

import {AutomatedMessageNodeType} from '../../../models/visualBuilderGraph.types'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import EdgeBlock from '../components/EdgeBlock'

import css from './Node.less'

function AutomatedMessageNode(
    node: NodeProps<AutomatedMessageNodeType['data']>
) {
    const {content} = node.data
    const {shouldShowErrors, isGreyedOut} = node.data
    const isErrored = content.text.length === 0
    const {visualBuilderNodeIdEditing} = useWorkflowEditorContext()
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
                    <Label className={css.nodeTitle}>
                        {content.text.length > 0 ? (
                            content.text
                        ) : (
                            <span className={css.clickToAdd}>Prompt</span>
                        )}
                    </Label>
                    <VisualBuilderActionTag nodeType="automated_message">
                        Automated message
                    </VisualBuilderActionTag>
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

export default React.memo(AutomatedMessageNode, (prevProps, nextProps) =>
    _isEqual(prevProps, nextProps)
)
