import classNames from 'classnames'
import React from 'react'
import {Handle, Position, NodeProps} from 'reactflow'
import _isEqual from 'lodash/isEqual'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {useWorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'
import Label from 'pages/common/forms/Label/Label'

import {TriggerButtonNodeType} from '../../../models/visualBuilderGraph.types'
import css from './Node.less'

function TriggerButtonNode(node: NodeProps<TriggerButtonNodeType['data']>) {
    const label = node.data.label
    const isErrored = label.length === 0
    const {visualBuilderNodeIdEditing, shouldShowErrors} =
        useWorkflowEditorContext()
    const isSelected = visualBuilderNodeIdEditing === node.id

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
                        {label.length > 0 ? (
                            node.data.label
                        ) : (
                            <span className={css.clickToAdd}>
                                Trigger button
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
}

export default React.memo(TriggerButtonNode, (prevProps, nextProps) =>
    _isEqual(prevProps, nextProps)
)
