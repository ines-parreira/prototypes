import React, {useRef, useState} from 'react'

import {useWorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import css from './NodeDeleteIcon.less'

export default function NodeDeleteIcon({
    node,
}: {
    node: {id: string; type: string}
}) {
    const {visualBuilderGraph} = useWorkflowEditorContext()
    const [isNodeMenuDropdownOpen, setIsNodeMenuDropdownOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const {dispatch} = useWorkflowEditorContext()
    const childrenNodeIds = visualBuilderGraph.edges
        .filter((e) => e.source === node.id)
        .map((e) => e.target)
    const childrenNodes = visualBuilderGraph.nodes.filter((n) =>
        childrenNodeIds.includes(n.id)
    )
    const isChildEndNode =
        childrenNodes.filter((n) => n.type === 'end').length === 1
    const hasMultipleDeleteChoices =
        childrenNodes.length === 1 && !isChildEndNode
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
                    nodeId: node.id,
                })
            }}
            onCancel={() => {
                dispatch({
                    type: 'GREY_OUT_BRANCH',
                    nodeId: node.id,
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
                            if (hasMultipleDeleteChoices) {
                                setIsNodeMenuDropdownOpen(true)
                            } else {
                                dispatch({
                                    type: 'GREY_OUT_BRANCH',
                                    nodeId: node.id,
                                    isGreyedOut: true,
                                })
                                onDisplayConfirmation()
                            }
                        }}
                    >
                        <i className="material-icons">delete</i>
                    </div>
                    {hasMultipleDeleteChoices && (
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
                                            nodeId: node.id,
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
                                            nodeId: node.id,
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
