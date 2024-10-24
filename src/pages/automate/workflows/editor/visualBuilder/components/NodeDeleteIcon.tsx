import React, {useRef, useState, useCallback} from 'react'

import {WorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

import css from './NodeDeleteIcon.less'

export type VisualBuilderDeleteProps = {
    nodeId: string
    hasMultipleChildren: boolean
    hasVariablesUsedInChildren: boolean
} & Pick<WorkflowEditorContext, 'dispatch'>

type ConfirmationPopoverBaseProps =
    | 'placement'
    | 'buttonProps'
    | 'showCancelButton'
    | 'cancelButtonProps'

export default function NodeDeleteIcon({
    nodeId,
    dispatch,
    hasMultipleChildren,
    hasVariablesUsedInChildren,
}: VisualBuilderDeleteProps) {
    const [isNodeMenuDropdownOpen, setIsNodeMenuDropdownOpen] = useState(false)

    const ref = useRef<HTMLDivElement>(null)
    const [intent, setIntent] = useState<
        'deleteSingleStep' | 'deleteAllStepsBelow'
    >()

    const getConfirmationPopoverProps = useCallback((): Omit<
        React.ComponentProps<typeof ConfirmationPopover>,
        'children'
    > => {
        const baseProps: Pick<
            React.ComponentProps<typeof ConfirmationPopover>,
            ConfirmationPopoverBaseProps
        > = {
            placement: 'top',
            buttonProps: {
                intent: 'destructive',
            },
            cancelButtonProps: {intent: 'secondary'},
            showCancelButton: true,
        }

        if (intent === 'deleteSingleStep') {
            return {
                ...baseProps,
                title: 'Delete step and all related variables?',
                content:
                    'The variable created by this step is used in other steps below. Deleting this step will result in unavailable variables and cannot be undone.',
                onConfirm: () => {
                    dispatch({
                        type: 'DELETE_NODE',
                        nodeId,
                    })
                },
                onCancel: () => {
                    dispatch({
                        type: 'GREY_OUT_BRANCH',
                        nodeId,
                        isGreyedOut: false,
                    })
                },
            }
        }
        return {
            ...baseProps,
            title: 'Delete step and children?',
            content:
                'Deleting this step will also delete any steps added below and cannot be undone',
            onConfirm: () => {
                dispatch({
                    type: 'DELETE_BRANCH',
                    nodeId,
                })
            },
            onCancel: () => {
                dispatch({
                    type: 'GREY_OUT_BRANCH',
                    nodeId,
                    isGreyedOut: false,
                })
            },
        }
    }, [dispatch, nodeId, intent])

    return (
        <ConfirmationPopover {...getConfirmationPopoverProps()}>
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
                                        if (hasVariablesUsedInChildren) {
                                            setIntent('deleteSingleStep')
                                            onDisplayConfirmation()
                                        } else {
                                            dispatch({
                                                type: 'DELETE_NODE',
                                                nodeId: nodeId,
                                            })
                                        }
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
