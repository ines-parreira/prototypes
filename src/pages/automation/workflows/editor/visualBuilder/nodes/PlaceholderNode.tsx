import classNames from 'classnames'
import React from 'react'
import {Handle, Position} from 'reactflow'

import css from './Node.less'

export default function PlaceholderNode() {
    return (
        <div className={classNames(css.node, css.placeholderNode)}>
            <Handle
                type="target"
                position={Position.Top}
                className={classNames(css.sourceHandle)}
            />
            <div
                className={classNames(css.placeholderContainer)}
                onClick={() => alert('TODO :)')}
            >
                <div className={classNames(css.nodeContent)}>
                    + Add reply buttons
                </div>
            </div>
        </div>
    )
}
