import classNames from 'classnames'
import React from 'react'
import {Handle, NodeProps, Position} from 'reactflow'
import _isEqual from 'lodash/isEqual'

import Label from 'pages/common/forms/Label/Label'
import VisualBuilderNodeAction from 'pages/automation/workflows/components/VisualBuilderNodeAction'
import {useWorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'

import {MultipleChoicesNodeType} from '../../../../models/visualBuilderGraph.types'
import NodeDeleteIcon from '../../components/NodeDeleteIcon'
import EdgeBlock from '../../components/EdgeBlock'

import css from '../Node.less'

function MultipleChoicesNode(node: NodeProps<MultipleChoicesNodeType['data']>) {
    const {content, choices, shouldShowErrors, isGreyedOut} = node.data
    const isErrored = content.text.length === 0 || choices.find((c) => !c.label)
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
                            <span className={css.clickToAdd}>Question</span>
                        )}
                    </Label>
                    <VisualBuilderNodeAction
                        text="Multiple choice"
                        color="blue"
                        icon="view_list"
                    />
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
