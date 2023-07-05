import React, {useCallback, useEffect, useRef, useState} from 'react'
import {NodeProps} from 'reactflow'
import classNames from 'classnames'
import {produce, Draft} from 'immer'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {useWorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'
import {
    VisualBuilderGraph,
    VisualBuilderNode,
    isMultipleChoicesNodeType,
} from 'pages/automation/workflows/models/visualBuilderGraph.types'

import {
    colorByVisualBuilderNodeType,
    materialIconByVisualBuilderNodeType,
} from 'pages/automation/workflows/constants'
import {
    useWorkflowChannelSupportContext,
    getChannelName,
} from 'pages/automation/workflows/hooks/useWorkflowChannelSupport'
import Tooltip from 'pages/common/components/Tooltip'
import {VisualBuilderGraphAction} from 'pages/automation/workflows/hooks/useVisualBuilderGraphReducer'

import EdgeIconButton from './EdgeIconButton'
import css from './EdgeBlock.less'

type MenuItem = {
    label: string
    type: NonNullable<VisualBuilderNode['type']>
    description: string
    icon: string
    style: {
        color: string
        backgroundColor: string
    }
    onClick: () => void
    hidden?: boolean
    disabledText?: string
}

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
    const choiceIndex =
        previousNode?.type === 'multiple_choices' && choiceEventId != null
            ? previousNode.data.choices.findIndex(
                  ({event_id}) => event_id === choiceEventId
              )
            : -1
    if (
        choiceIndex >= 0 &&
        previousNode &&
        isMultipleChoicesNodeType(previousNode)
    ) {
        return (
            previousNode.data.choices[choiceIndex].label ||
            `Option ${choiceIndex + 1}`
        )
    }
    return undefined
}

function useMenuItems(
    nodeId: string,
    dispatch: React.Dispatch<VisualBuilderGraphAction>
) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([
        {
            label: 'Multiple choice',
            type: 'multiple_choices',
            description: 'Display up to 6 options',
            icon: materialIconByVisualBuilderNodeType.multiple_choices,
            style: colorByVisualBuilderNodeType.multiple_choices,
            onClick: () => {
                dispatch({
                    type: 'INSERT_MULTIPLE_CHOICES_NODE',
                    beforeNodeId: nodeId,
                })
            },
        },
        {
            label: 'Collect text reply',
            description: 'Allow up to 5,000 characters',
            type: 'text_reply',
            icon: materialIconByVisualBuilderNodeType.text_reply,
            style: colorByVisualBuilderNodeType.text_reply,
            hidden: true,
            onClick: () => {
                dispatch({
                    type: 'INSERT_TEXT_REPLY_NODE',
                    beforeNodeId: nodeId,
                })
            },
        },
        {
            label: 'Collect file upload',
            description: 'Allow up to 5 files',
            type: 'file_upload',
            icon: materialIconByVisualBuilderNodeType.file_upload,
            style: colorByVisualBuilderNodeType.file_upload,
            hidden: true,
            onClick: () => {
                dispatch({
                    type: 'INSERT_FILE_UPLOAD_NODE',
                    beforeNodeId: nodeId,
                })
            },
        },
        {
            label: 'Automated answer',
            description: 'Display short text',
            type: 'automated_message',
            icon: materialIconByVisualBuilderNodeType.automated_message,
            style: colorByVisualBuilderNodeType.automated_message,
            onClick: () => {
                dispatch({
                    type: 'INSERT_AUTOMATED_MESSAGE_NODE',
                    beforeNodeId: nodeId,
                })
            },
        },
    ])
    const updateMenuItems = useCallback(
        (immerProducer: (draft: Draft<MenuItem>) => void) => {
            setMenuItems((menuItems) =>
                menuItems.map((item) => produce(item, immerProducer))
            )
        },
        [setMenuItems]
    )
    return {
        menuItems,
        updateMenuItems,
    }
}

function useMenuItemsForConnectedChannels(
    nodeId: string,
    dispatch: React.Dispatch<VisualBuilderGraphAction>,
    configurationId: string
) {
    const {menuItems, updateMenuItems} = useMenuItems(nodeId, dispatch)
    const {
        isStepUnsupportedInAllChannels,
        getUnsupportedConnectedChannels,
        getSupportedChannels,
    } = useWorkflowChannelSupportContext()
    useEffect(() => {
        if (!isStepUnsupportedInAllChannels('text_reply')) {
            updateMenuItems((draft) => {
                if (
                    draft.type === 'text_reply' ||
                    draft.type === 'file_upload'
                ) {
                    draft.hidden = false
                }
            })
        }
    }, [isStepUnsupportedInAllChannels, updateMenuItems])
    useEffect(() => {
        async function f() {
            const unsupportedConnectedChannels =
                await getUnsupportedConnectedChannels(
                    configurationId,
                    'text_reply'
                )
            const supportedChannels = getSupportedChannels('text_reply')
            const shopperInputDisabledText =
                unsupportedConnectedChannels.length > 0
                    ? ` This step is currently only supported in ${supportedChannels
                          .map(getChannelName)
                          .join('and')}.
                    Disable the flow in other channels to use this step.`
                    : ''
            if (shopperInputDisabledText) {
                updateMenuItems((draft) => {
                    if (
                        draft.type === 'text_reply' ||
                        draft.type === 'file_upload'
                    ) {
                        draft.disabledText = shopperInputDisabledText
                    }
                })
            }
        }
        void f()
    }, [
        getSupportedChannels,
        getUnsupportedConnectedChannels,
        updateMenuItems,
        configurationId,
    ])
    return menuItems
}

export default function EdgeBlock({node}: {node: NodeProps}) {
    const edgeRef = useRef<HTMLDivElement>(null)
    const [floatingRef, setFloatingRef] = useState<HTMLElement | null>(null)
    const onFloatingRefChange = useCallback((node: HTMLElement | null) => {
        setFloatingRef(node)
    }, [])
    const [isNodeMenuDropdownOpen, setIsNodeMenuDropdownOpen] = useState(false)
    const {dispatch, visualBuilderGraph, configuration} =
        useWorkflowEditorContext()
    const incomingChoiceLabel = getIncomingChoiceLabel(
        visualBuilderGraph,
        node.id
    )
    const menuItems = useMenuItemsForConnectedChannels(
        node.id,
        dispatch,
        configuration.id
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
                ref={onFloatingRefChange}
                isOpen={isNodeMenuDropdownOpen}
                onToggle={setIsNodeMenuDropdownOpen}
                target={edgeRef}
                placement="right-start"
                className={css.menuContainer}
            >
                <DropdownBody>
                    {menuItems
                        .filter((item) => !item.hidden)
                        .map(
                            ({
                                type,
                                label,
                                description,
                                icon,
                                style,
                                disabledText,
                                onClick,
                            }) => (
                                <DropdownItem
                                    id={`dropdown-item-${type}`}
                                    key={label}
                                    option={{
                                        label,
                                        value: label,
                                    }}
                                    onClick={onClick}
                                    shouldCloseOnSelect
                                    className={classNames(
                                        css.menuItemContainer,
                                        {
                                            [css.disabled]: disabledText,
                                        }
                                    )}
                                >
                                    <div className={css.menuIcon} style={style}>
                                        <i
                                            className={classNames(
                                                'material-icons'
                                            )}
                                        >
                                            {icon}
                                        </i>
                                    </div>
                                    <div>
                                        {label}
                                        <div
                                            className={css.menuItemDescription}
                                        >
                                            {description}
                                        </div>
                                    </div>
                                    {disabledText &&
                                        floatingRef?.parentElement && (
                                            <Tooltip
                                                placement="top-start"
                                                target={`dropdown-item-${type}`}
                                                container={
                                                    floatingRef.parentElement
                                                }
                                            >
                                                {disabledText}
                                            </Tooltip>
                                        )}
                                </DropdownItem>
                            )
                        )}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
