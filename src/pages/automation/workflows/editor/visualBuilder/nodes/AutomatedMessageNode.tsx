import classNames from 'classnames'
import React from 'react'
import {Handle, Position, NodeProps} from 'reactflow'
import Label from 'pages/common/forms/Label/Label'

import {AutomatedMessageNodeType} from '../types'
import css from './Node.less'

export default function AutomatedMessageNode({
    data,
}: NodeProps<AutomatedMessageNodeType['data']>) {
    const {shouldShowErrors} = data
    const isErrored = data.message.content.text.length === 0
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
                    <Label>Automated message</Label>
                </div>
                <div
                    className={classNames(css.nodeContent, {
                        [css.nodeContentErrored]: shouldShowErrors && isErrored,
                    })}
                >
                    {data.message.content.text.length > 0 ? (
                        data.message.content.text
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
