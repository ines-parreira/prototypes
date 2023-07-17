import classNames from 'classnames'
import React from 'react'
import {Handle, Position, NodeProps} from 'reactflow'
import _isEqual from 'lodash/isEqual'

import Label from 'pages/common/forms/Label/Label'
import {useWorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'
import VisualBuilderActionTag from 'pages/automation/workflows/components/VisualBuilderActionTag'

import {TextReplyNodeType} from '../../../models/visualBuilderGraph.types'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import EdgeBlock from '../components/EdgeBlock'

import css from './Node.less'

function TextReplyNode(node: NodeProps<TextReplyNodeType['data']>) {
    const {content} = node.data
    const {isGreyedOut} = node.data
    const isErrored = content.text.length === 0
    const {visualBuilderNodeIdEditing, shouldShowErrors} =
        useWorkflowEditorContext()
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
                    <VisualBuilderActionTag nodeType="text_reply">
                        Collect text reply
                    </VisualBuilderActionTag>
                    <Label className={css.nodeTitle}>
                        {content.text.length > 0 ? (
                            content.text
                        ) : (
                            <span className={css.clickToAdd}>Message</span>
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

export default React.memo(TextReplyNode, (prevProps, nextProps) =>
    _isEqual(prevProps, nextProps)
)
