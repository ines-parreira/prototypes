import classNames from 'classnames'
import React from 'react'
import {Handle, Position} from 'reactflow'

import {useWorkflowConfigurationContext} from '../../hooks/useWorkflowConfiguration'
import css from './Node.less'

export default function PlaceholderNode({
    data,
}: {
    data: {parentStepId: string}
}) {
    const {dispatch} = useWorkflowConfigurationContext()
    return (
        <div className={classNames(css.node, css.placeholderNode)}>
            <Handle
                type="target"
                position={Position.Top}
                className={classNames(css.sourceHandle)}
            />
            <div
                className={classNames(css.placeholderContainer)}
                onClick={() =>
                    dispatch({
                        type: 'ADD_REPLY_BUTTONS',
                        step_id: data.parentStepId,
                    })
                }
            >
                <div className={classNames(css.nodeContent)}>
                    + Add reply buttons
                </div>
            </div>
        </div>
    )
}
