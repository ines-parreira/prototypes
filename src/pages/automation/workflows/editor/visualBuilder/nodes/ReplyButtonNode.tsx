import classNames from 'classnames'
import React from 'react'
import {Handle, Position, NodeProps} from 'reactflow'
import Label from 'pages/common/forms/Label/Label'

import {ReplyButtonNodeType} from '../types'
import css from './Node.less'

export default function ReplyButtonNode({
    data,
}: NodeProps<ReplyButtonNodeType['data']>) {
    const {shouldShowErrors} = data
    const isErrored = data.choice.label.length === 0
    return (
        <div
            className={classNames(css.node, {
                [css.nodeErrored]: shouldShowErrors && isErrored,
            })}
        >
            <Handle
                type="target"
                position={Position.Top}
                className={css.sourceHandle}
            />
            <div className={css.nodeContainer}>
                <div className={css.nodeTitle}>
                    <Label>Reply button</Label>
                </div>
                <div
                    className={classNames(css.nodeContent, {
                        [css.nodeContentErrored]: shouldShowErrors && isErrored,
                    })}
                >
                    {data.choice.label.length > 0 ? (
                        data.choice.label
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
