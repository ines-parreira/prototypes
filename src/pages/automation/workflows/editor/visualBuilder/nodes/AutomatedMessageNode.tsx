import classNames from 'classnames'
import React from 'react'
import {Handle, Position, NodeProps} from 'reactflow'
import Label from 'pages/common/forms/Label/Label'

import {useWorkflowConfigurationContext} from '../../hooks/useWorkflowConfiguration'
import {WorkflowStepChoices} from '../../../hooks/useWorkflowApi'
import {AutomatedMessageNodeType} from '../types'
import css from './Node.less'
import NodeMenuDropdown from './NodeMenuDropdown'

const maxChildrenChoices = 6

export default function AutomatedMessageNode({
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
                {childrenChoices.length > 0 && (
                    <NodeMenuDropdown
                        isDisabled={
                            childrenChoices.length >= maxChildrenChoices
                        }
                        disabledText="You have added the maximum number of reply buttons allowed following this message."
                        options={[
                            {
                                onSelect: () => {
                                    dispatch({
                                        type: 'ADD_REPLY_BUTTON',
                                        step_id: data.step_id,
                                    })
                                },
                                content: (
                                    <>
                                        <i
                                            className={classNames(
                                                'material-icons',
                                                css['treeDotMenuItemIcon']
                                            )}
                                        >
                                            add
                                        </i>
                                        Add reply button below
                                    </>
                                ),
                            },
                        ]}
                    />
                )}
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className={classNames(css.targetHandle)}
            />
        </div>
    )
}
