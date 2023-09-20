import React, {useRef, useState} from 'react'

import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {WorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'

import css from './NodeDeleteIcon.less'

export type VisualBuilderDeleteProps = {
    nodeId: string
    hasMultipleChildren: boolean
} & Pick<WorkflowEditorContext, 'dispatch'>

export default function NodeDeleteIcon({
    nodeId,
    dispatch,
    hasMultipleChildren,
}: VisualBuilderDeleteProps) {
    const [isNodeMenuDropdownOpen, setIsNodeMenuDropdownOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    return (
        <ConfirmationPopover
            placement="top"
            buttonProps={{
                intent: 'destructive',
            }}
            title="Delete step and children?"
            content="Deleting this step will also delete any steps added below and cannot be undone"
            onConfirm={() => {
                dispatch({
                    type: 'DELETE_BRANCH',
                    nodeId,
                })
            }}
            onCancel={() => {
                dispatch({
                    type: 'GREY_OUT_BRANCH',
                    nodeId,
                    isGreyedOut: false,
                })
            }}
            cancelButtonProps={{intent: 'secondary'}}
            showCancelButton
        >
            {({uid, onDisplayConfirmation}) => (
                <>
                    <div
                        ref={ref}
                        id={uid}
                        className={css.deleteIcon}
                        onClick={(e) => {
                            e.stopPropagation()
                            if (!hasMultipleChildren) {
                                setIsNodeMenuDropdownOpen(true)
                            } else {
                                dispatch({
                                    type: 'GREY_OUT_BRANCH',
                                    nodeId: nodeId,
                                    isGreyedOut: true,
                                })
                                onDisplayConfirmation()
                            }
                        }}
                    >
                        <i className="material-icons">delete</i>
                    </div>
                    {!hasMultipleChildren && (
                        <Dropdown
                            isOpen={isNodeMenuDropdownOpen}
                            onToggle={setIsNodeMenuDropdownOpen}
                            target={ref}
                            placement="right-start"
                        >
                            <DropdownBody>
                                <DropdownItem
                                    option={{
                                        label: 'Delete this step only',
                                        value: 'node',
                                    }}
                                    onClick={() => {
                                        dispatch({
                                            type: 'DELETE_NODE',
                                            nodeId: nodeId,
                                        })
                                    }}
                                    shouldCloseOnSelect
                                />
                                <DropdownItem
                                    option={{
                                        label: 'Delete this step and all steps below',
                                        value: 'branch',
                                    }}
                                    onClick={() => {
                                        dispatch({
                                            type: 'GREY_OUT_BRANCH',
                                            nodeId: nodeId,
                                            isGreyedOut: true,
                                        })
                                        onDisplayConfirmation()
                                    }}
                                    shouldCloseOnSelect
                                />
                            </DropdownBody>
                        </Dropdown>
                    )}
                </>
            )}
        </ConfirmationPopover>
    )
}
