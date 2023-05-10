import classNames from 'classnames'
import React from 'react'
import {Handle, Position, NodeProps} from 'reactflow'
import _isEqual from 'lodash/isEqual'

import Label from 'pages/common/forms/Label/Label'

import {useWorkflowConfigurationContext} from '../../hooks/useWorkflowConfiguration'
import {WorkflowStepChoices} from '../../../hooks/useWorkflowApi'
import EdgeButton from '../components/EdgeButton'
import {AutomatedMessageNodeType} from '../types'

import css from './Node.less'

const maxChildrenChoices = 6

function AutomatedMessageNode({
    data,
}: NodeProps<AutomatedMessageNodeType['data']>) {
    const {dispatch, configuration} = useWorkflowConfigurationContext()
    const childStepId = configuration.transitions.find(
        (t) => t.from_step_id === data.step_id
    )?.to_step_id
    const childrenChoices =
        configuration.steps.find(
            (s): s is WorkflowStepChoices => s.id === childStepId
        )?.settings.choices ?? []

    const {shouldShowErrors, isGreyedOut} = data
    const isErrored = data.message.content.text.length === 0

    const addNode = childrenChoices.length > 0 && (
        <div
            className={css.addNodeIconContainer}
            onClick={(e) => {
                e.stopPropagation()
            }}
            style={{bottom: childrenChoices.length > 1 ? -28 : -34}}
        >
            <EdgeButton
                icon="add"
                onClick={() => {
                    dispatch({
                        type: 'ADD_REPLY_BUTTON',
                        step_id: data.step_id,
                    })
                }}
                isDisabled={childrenChoices.length >= maxChildrenChoices}
                disabledTooltip="You have reached the maximum number of buttons."
            >
                Button
            </EdgeButton>
        </div>
    )

    return (
        <div
            className={classNames(css.node, {
                [css.nodeErrored]: shouldShowErrors && isErrored,
                [css.nodeGreyedOut]: isGreyedOut,
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
            {addNode}
        </div>
    )
}

export default React.memo(AutomatedMessageNode, (prevProps, nextProps) =>
    _isEqual(prevProps, nextProps)
)
