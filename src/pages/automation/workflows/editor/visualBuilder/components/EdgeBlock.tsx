import React, {useRef, useState} from 'react'
import {NodeProps} from 'reactflow'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {useWorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'
import {VisualBuilderGraph} from 'pages/automation/workflows/models/visualBuilderGraph.types'

import EdgeIconButton from './EdgeIconButton'

import css from './EdgeBlock.less'

function getIncomingChoiceLabel(
    visualBuilderGraph: VisualBuilderGraph,
    currentNodeId: string
) {
    const incomingEdge = visualBuilderGraph.edges.find(
        ({target}) => target === currentNodeId
    )
    const choiceEventId = incomingEdge?.data?.event?.id
    const previousNodeId = incomingEdge?.source
    const previousNode = previousNodeId
        ? visualBuilderGraph.nodes.find(({id}) => id === previousNodeId)
        : undefined
    const choiceLabel =
        previousNode?.type === 'multiple_choices' && choiceEventId != null
            ? previousNode.data.choices.find(
                  ({event_id}) => event_id === choiceEventId
              )?.label
            : undefined
    return choiceLabel
}

export default function EdgeBlock({node}: {node: NodeProps}) {
    const edgeRef = useRef<HTMLDivElement>(null)
    const [isNodeMenuDropdownOpen, setIsNodeMenuDropdownOpen] = useState(false)
    const {dispatch, visualBuilderGraph} = useWorkflowEditorContext()
    const incomingChoiceLabel = getIncomingChoiceLabel(
        visualBuilderGraph,
        node.id
    )

    return (
        <div
            className={css.addNodeIconContainer}
            onClick={(e) => {
                e.stopPropagation()
            }}
            style={{
                top: incomingChoiceLabel != null ? -48 : -46,
            }}
        >
            {incomingChoiceLabel === '' && (
                <Badge className={css.edgeLabel}>Reply button</Badge>
            )}
            {incomingChoiceLabel && (
                <Badge type={ColorType.Blue} className={css.edgeLabel}>
                    {incomingChoiceLabel}
                </Badge>
            )}
            <EdgeIconButton
                ref={edgeRef}
                icon="add"
                onClick={() => {
                    setIsNodeMenuDropdownOpen(true)
                }}
            />
            <Dropdown
                isOpen={isNodeMenuDropdownOpen}
                onToggle={setIsNodeMenuDropdownOpen}
                target={edgeRef}
                placement="right-start"
            >
                <DropdownBody>
                    <DropdownItem
                        option={{
                            label: 'Multiple choice (6 maximum)',
                            value: 'multiple_choices',
                        }}
                        onClick={() => {
                            dispatch({
                                type: 'INSERT_MULTIPLE_CHOICES_NODE',
                                beforeNodeId: node.id,
                            })
                        }}
                        shouldCloseOnSelect
                    />
                    <DropdownItem
                        option={{
                            label: 'Automated message',
                            value: 'automated_message',
                        }}
                        onClick={() => {
                            dispatch({
                                type: 'INSERT_AUTOMATED_MESSAGE_NODE',
                                beforeNodeId: node.id,
                            })
                        }}
                        shouldCloseOnSelect
                    />
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
