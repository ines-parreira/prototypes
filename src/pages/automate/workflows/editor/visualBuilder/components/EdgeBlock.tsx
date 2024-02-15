import React, {ReactNode, useCallback, useEffect, useRef, useState} from 'react'
import classNames from 'classnames'
import {produce, Draft} from 'immer'

import {noop} from 'lodash'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {
    useWorkflowEditorContext,
    WorkflowEditorContext,
} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {VisualBuilderNode} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import {
    colorByVisualBuilderNodeType,
    iconByVisualBuilderNodeType,
    labelByVisualBuilderNodeType,
} from 'pages/automate/workflows/constants'
import {
    useWorkflowChannelSupportContext,
    getChannelName,
    optionalNodeTypes,
} from 'pages/automate/workflows/hooks/useWorkflowChannelSupport'
import Tooltip from 'pages/common/components/Tooltip'
import {VisualBuilderGraphAction} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import {useSelfServiceStoreIntegrationContext} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import orderSelectionIcon from 'assets/img/workflows/icons/order-selection.svg'

import {
    hasParentNodeInPath,
    isNodeUniquePerPath,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import EdgeIconButton from './EdgeIconButton'
import EdgeLabel from './EdgeLabel'
import css from './EdgeBlock.less'

type MenuItem = {
    label: string
    type: NonNullable<VisualBuilderNode['type']>
    description: string
    icon: ReactNode
    style: {
        color: string
        backgroundColor: string
    }
    onClick: () => void
    hidden?: boolean
    disabledText?: string
}

function useMenuItems(
    nodeId: string,
    dispatch: React.Dispatch<VisualBuilderGraphAction>
) {
    const storeIntegration = useSelfServiceStoreIntegrationContext()
    const {visualBuilderGraph} = useWorkflowEditorContext()
    const [menuItems, setMenuItems] = useState<MenuItem[]>([
        {
            label: labelByVisualBuilderNodeType.multiple_choices,
            type: 'multiple_choices',
            description: 'Display up to 6 options',
            icon: iconByVisualBuilderNodeType.multiple_choices,
            style: colorByVisualBuilderNodeType.multiple_choices,
            onClick: () => {
                dispatch({
                    type: 'INSERT_MULTIPLE_CHOICES_NODE',
                    beforeNodeId: nodeId,
                })
            },
        },
        {
            label: labelByVisualBuilderNodeType.text_reply,
            description: 'Allow up to 5,000 characters',
            type: 'text_reply',
            icon: iconByVisualBuilderNodeType.text_reply,
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
            label: labelByVisualBuilderNodeType.file_upload,
            description: 'Allow up to 5 files',
            type: 'file_upload',
            icon: iconByVisualBuilderNodeType.file_upload,
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
            label: labelByVisualBuilderNodeType.automated_message,
            description: 'Display short text',
            type: 'automated_message',
            icon: iconByVisualBuilderNodeType.automated_message,
            style: colorByVisualBuilderNodeType.automated_message,
            onClick: () => {
                dispatch({
                    type: 'INSERT_AUTOMATED_MESSAGE_NODE',
                    beforeNodeId: nodeId,
                })
            },
        },
        {
            label: labelByVisualBuilderNodeType.order_selection,
            description: 'Display last 5 orders',
            type: 'order_selection',
            icon: <img src={orderSelectionIcon} alt="" />,
            style: colorByVisualBuilderNodeType.order_selection,
            hidden: true,
            onClick: () => {
                dispatch({
                    type: 'INSERT_ORDER_SELECTION_NODE',
                    beforeNodeId: nodeId,
                })
            },
        },
        {
            label: labelByVisualBuilderNodeType.http_request,
            description: 'Perform 3rd party actions',
            type: 'http_request',
            icon: iconByVisualBuilderNodeType.http_request,
            style: colorByVisualBuilderNodeType.http_request,
            hidden: true,
            onClick: () => {
                dispatch({
                    type: 'INSERT_HTTP_REQUEST_NODE',
                    beforeNodeId: nodeId,
                })
            },
        },
        {
            label: labelByVisualBuilderNodeType.shopper_authentication,
            description: 'Confirm customer identity',
            type: 'shopper_authentication',
            icon: iconByVisualBuilderNodeType.shopper_authentication,
            style: colorByVisualBuilderNodeType.shopper_authentication,
            hidden: true,
            onClick: () => {
                dispatch({
                    type: 'INSERT_SHOPPER_AUTHENTICATION_NODE',
                    beforeNodeId: nodeId,
                    storeIntegrationId: storeIntegration.id,
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

    useEffect(() => {
        if (
            !isNodeUniquePerPath(
                'shopper_authentication',
                visualBuilderGraph,
                nodeId
            )
        ) {
            updateMenuItems((draft) => {
                if (draft.type === 'shopper_authentication') {
                    draft.disabledText =
                        'This step can only be used once per path in a Flow.'
                }
            })
        } else {
            updateMenuItems((draft) => {
                if (
                    draft.type === 'shopper_authentication' &&
                    draft.disabledText
                ) {
                    draft.disabledText = ''
                }
            })
        }

        if (
            !hasParentNodeInPath(
                'shopper_authentication',
                visualBuilderGraph,
                nodeId
            )
        ) {
            updateMenuItems((draft) => {
                if (draft.type === 'order_selection') {
                    draft.disabledText =
                        'Add a Customer login step first in order to use this step.'
                }
            })
        } else {
            updateMenuItems((draft) => {
                if (draft.type === 'order_selection' && draft.disabledText) {
                    draft.disabledText = ''
                }
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        visualBuilderGraph.nodes.length,
        nodeId,
        updateMenuItems,
        isNodeUniquePerPath,
    ])

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
        optionalNodeTypes.map((nodeType) => {
            if (!isStepUnsupportedInAllChannels(nodeType)) {
                updateMenuItems((draft) => {
                    if (draft.type === nodeType) {
                        draft.hidden = false
                    }
                })
            }
        })
    }, [isStepUnsupportedInAllChannels, updateMenuItems])

    useEffect(() => {
        optionalNodeTypes.map(async (nodeType) => {
            const unsupportedConnectedChannels =
                await getUnsupportedConnectedChannels(configurationId, nodeType)
            const supportedChannels = getSupportedChannels(nodeType)
            const disabledText =
                unsupportedConnectedChannels.length > 0
                    ? ` This step is currently only supported in ${supportedChannels
                          .map(getChannelName)
                          .join('and')}.
                    Disable the flow in other channels to use this step.`
                    : ''
            if (disabledText) {
                updateMenuItems((draft) => {
                    if (draft.type === nodeType) {
                        draft.disabledText = disabledText
                    }
                })
            }
        })
    }, [
        getSupportedChannels,
        getUnsupportedConnectedChannels,
        updateMenuItems,
        configurationId,
    ])
    return {
        menuItems,
        updateMenuItems,
    }
}

export type VisualBuilderEdgeProps = {
    nodeId: string
    configurationId: string
    isSelected: boolean
    incomingChoice?: {
        label: string
        eventId: string
        nodeId: string
    }
} & Pick<
    WorkflowEditorContext,
    | 'dispatch'
    | 'setVisualBuilderChoiceEventIdEditing'
    | 'setVisualBuilderNodeIdEditing'
>

export default function EdgeBlock({
    nodeId,
    configurationId,
    incomingChoice,
    isSelected,
    setVisualBuilderChoiceEventIdEditing,
    setVisualBuilderNodeIdEditing,
    dispatch,
}: VisualBuilderEdgeProps) {
    const edgeRef = useRef<HTMLDivElement>(null)
    const [floatingRef, setFloatingRef] = useState<HTMLElement | null>(null)
    const onFloatingRefChange = useCallback((node: HTMLElement | null) => {
        setFloatingRef(node)
    }, [])
    const [isNodeMenuDropdownOpen, setIsNodeMenuDropdownOpen] = useState(false)
    const {menuItems} = useMenuItemsForConnectedChannels(
        nodeId,
        dispatch,
        configurationId
    )

    return (
        <div
            className={css.addNodeIconContainer}
            onClick={(e) => {
                e.stopPropagation()
            }}
            style={{
                top: incomingChoice != null ? -48 : -46,
            }}
        >
            {incomingChoice && (
                <EdgeLabel
                    onClick={() => {
                        setVisualBuilderChoiceEventIdEditing(
                            incomingChoice.eventId
                        )
                        setVisualBuilderNodeIdEditing(incomingChoice.nodeId)
                    }}
                    isSelected={isSelected}
                >
                    {incomingChoice.label}
                </EdgeLabel>
            )}
            <EdgeIconButton
                ref={edgeRef}
                icon="add"
                onClick={() => setIsNodeMenuDropdownOpen(true)}
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
                                    onClick={disabledText ? noop : onClick}
                                    shouldCloseOnSelect={!disabledText}
                                    className={classNames(
                                        css.menuItemContainer,
                                        {
                                            [css.disabled]: disabledText,
                                        }
                                    )}
                                >
                                    <div className={css.menuIcon} style={style}>
                                        {icon}
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
