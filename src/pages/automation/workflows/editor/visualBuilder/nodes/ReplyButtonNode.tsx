import classNames from 'classnames'
import React from 'react'
import {Handle, Position, NodeProps, useReactFlow} from 'reactflow'
import _isEqual from 'lodash/isEqual'

import Label from 'pages/common/forms/Label/Label'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

import {useWorkflowConfigurationContext} from '../../hooks/useWorkflowConfiguration'
import {ReplyButtonNodeType} from '../types'

import css from './Node.less'

function ReplyButtonNode({id, data}: NodeProps<ReplyButtonNodeType['data']>) {
    const {dispatch} = useWorkflowConfigurationContext()
    const {setNodes, getEdges} = useReactFlow()
    const {shouldShowErrors, isGreyedOut} = data
    const isErrored = data.choice.label.length === 0
    const setIsGreyedOutChildren = (isGreyedOut: boolean) => {
        const edges = getEdges()
        const childrenIdsArr = [id]
        function gatherChildrenIds(currentId: string): void {
            const childrenIds = edges
                .filter((e) => e.source === currentId)
                .map((e) => e.target)
            childrenIdsArr.push(...childrenIds)
            childrenIds.forEach((childId) => gatherChildrenIds(childId))
        }
        gatherChildrenIds(id)
        const childrenIds = new Set(childrenIdsArr)
        setNodes((ns) =>
            ns.map((n) =>
                childrenIds.has(n.id)
                    ? {...n, data: {...n.data, isGreyedOut}}
                    : n
            )
        )
    }
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
                    <Label>Button</Label>
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
                <ConfirmationPopover
                    placement="top"
                    buttonProps={{
                        intent: 'destructive',
                    }}
                    title="Delete step?"
                    content="Deleting this step will also delete any steps added below and cannot be undone"
                    onConfirm={() => {
                        dispatch({
                            type: 'DELETE_CHOICE',
                            step_id: data.step_id,
                            choice_event_id: data.choice.event_id,
                        })
                    }}
                    onCancel={() => {
                        setIsGreyedOutChildren(false)
                    }}
                    cancelButtonProps={{intent: 'secondary'}}
                    showCancelButton
                >
                    {({uid, onDisplayConfirmation}) => (
                        <div
                            id={uid}
                            className={css.itemDeleteIcon}
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsGreyedOutChildren(true)
                                onDisplayConfirmation()
                            }}
                        >
                            <i className="material-icons">delete</i>
                        </div>
                    )}
                </ConfirmationPopover>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className={classNames(css.targetHandle)}
            />
        </div>
    )
}

export default React.memo(ReplyButtonNode, (prevProps, nextProps) =>
    _isEqual(prevProps, nextProps)
)
