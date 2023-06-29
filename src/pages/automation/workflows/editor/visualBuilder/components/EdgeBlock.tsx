import React, {useRef, useState} from 'react'
import {NodeProps} from 'reactflow'
import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {useWorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'
import {VisualBuilderGraph} from 'pages/automation/workflows/models/visualBuilderGraph.types'

import {
    colorByVisualBuilderNodeType,
    materialIconByVisualBuilderNodeType,
} from 'pages/automation/workflows/constants'

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
    const shouldShowCollectSteps: boolean | undefined =
        useFlags()[FeatureFlagKey.FlowsCollectSteps]

    const menuItems = [
        {
            label: 'Multiple choice',
            description: 'Display up to 6 options',
            icon: materialIconByVisualBuilderNodeType.multiple_choices,
            style: colorByVisualBuilderNodeType.multiple_choices,
            onClick: () => {
                dispatch({
                    type: 'INSERT_MULTIPLE_CHOICES_NODE',
                    beforeNodeId: node.id,
                })
            },
        },
        ...(shouldShowCollectSteps
            ? [
                  {
                      label: 'Collect text reply',
                      description: 'Allow up to 5,000 characters',
                      icon: materialIconByVisualBuilderNodeType.text_reply,
                      style: colorByVisualBuilderNodeType.text_reply,
                      onClick: () => {
                          dispatch({
                              type: 'INSERT_TEXT_REPLY_NODE',
                              beforeNodeId: node.id,
                          })
                      },
                  },
                  {
                      label: 'Collect file upload',
                      description: 'Allow up to 5 files',
                      icon: materialIconByVisualBuilderNodeType.file_upload,
                      style: colorByVisualBuilderNodeType.file_upload,
                      onClick: () => {
                          dispatch({
                              type: 'INSERT_FILE_UPLOAD_NODE',
                              beforeNodeId: node.id,
                          })
                      },
                  },
              ]
            : []),
        {
            label: 'Message',
            description: 'Display short text',
            icon: materialIconByVisualBuilderNodeType.automated_message,
            style: colorByVisualBuilderNodeType.automated_message,
            onClick: () => {
                dispatch({
                    type: 'INSERT_AUTOMATED_MESSAGE_NODE',
                    beforeNodeId: node.id,
                })
            },
        },
    ]

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
                className={css.menuContainer}
            >
                <DropdownBody>
                    {menuItems.map(
                        ({label, description, icon, style, onClick}) => (
                            <DropdownItem
                                key={label}
                                option={{
                                    label,
                                    value: label,
                                }}
                                onClick={onClick}
                                shouldCloseOnSelect
                                className={css.menuItemContainer}
                            >
                                <div className={css.menuIcon} style={style}>
                                    <i className={classNames('material-icons')}>
                                        {icon}
                                    </i>
                                </div>
                                <div>
                                    {label}
                                    <div className={css.menuItemDescription}>
                                        {description}
                                    </div>
                                </div>
                            </DropdownItem>
                        )
                    )}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
