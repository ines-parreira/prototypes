import classNames from 'classnames'
import React from 'react'
import {Handle, Position, NodeProps} from 'reactflow'
import Label from 'pages/common/forms/Label/Label'

import {TriggerButtonNodeType} from '../types'
import {useWorkflowEntrypointContext} from '../../hooks/useWorkflowEntrypoint'
import css from './Node.less'

export default function TriggerButtonNode({
    data,
}: NodeProps<TriggerButtonNodeType['data']>) {
    const {validationError, shouldShowErrors} = useWorkflowEntrypointContext()
    return (
        <div
            className={classNames(css.node, {
                [css.nodeErrored]: shouldShowErrors && validationError,
            })}
        >
            <Handle
                type="target"
                position={Position.Top}
                className={css.sourceHandle}
            />
            <div className={css.nodeContainer}>
                <div className={css.nodeTitle}>
                    <Label>Trigger button</Label>
                </div>
                <div
                    className={classNames(css.nodeContent, {
                        [css.nodeContentErrored]:
                            shouldShowErrors && validationError,
                    })}
                >
                    {data.entrypoint_label.length > 0 ? (
                        data.entrypoint_label
                    ) : (
                        <span className={css.clickToAdd}>Click to add</span>
                    )}
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className={classNames(css.targetHandle)}
            />
        </div>
    )
}
