import {Tooltip} from '@gorgias/ui-kit'
import classNames from 'classnames'
import {noop} from 'lodash'
import React, {ReactNode, useCallback, useMemo, useRef, useState} from 'react'

import {useSelfServiceStoreIntegrationContext} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {
    colorByVisualBuilderNodeType,
    iconByVisualBuilderNodeType,
    labelByVisualBuilderNodeType,
} from 'pages/automate/workflows/constants'
import {
    useVisualBuilderContext,
    VisualBuilderContext,
} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    getChannelName,
    useWorkflowChannelSupportContext,
} from 'pages/automate/workflows/hooks/useWorkflowChannelSupport'
import {
    hasParentNodeInPath,
    isNodeUniquePerPath,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {isTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import css from './EdgeBlock.less'
import EdgeIconButton from './EdgeIconButton'
import EdgeLabel from './EdgeLabel'

type MenuItemProps = {
    label: string
    description: string
    icon: ReactNode
    style: {
        color: string
        backgroundColor: string
    }
    onClick: () => void
    disabledText?: string
    floatingRef?: HTMLElement | null
}

const MenuItem = ({
    label,
    onClick,
    disabledText,
    style,
    icon,
    description,
    floatingRef,
}: MenuItemProps) => {
    const [ref, setRef] = useState<HTMLElement | null>(null)

    return (
        <DropdownItem
            ref={setRef}
            option={{
                label,
                value: label,
            }}
            onClick={disabledText ? noop : onClick}
            shouldCloseOnSelect={!disabledText}
            className={classNames(css.menuItemContainer, {
                [css.disabled]: disabledText,
            })}
        >
            <div className={css.menuIcon} style={style}>
                {icon}
            </div>
            <div>
                {label}
                <div className={css.menuItemDescription}>{description}</div>
            </div>
            {disabledText && floatingRef && ref && (
                <Tooltip
                    placement="top-start"
                    target={ref}
                    container={floatingRef}
                >
                    {disabledText}
                </Tooltip>
            )}
        </DropdownItem>
    )
}

const MultipleChoicesMenuItem = ({
    nodeId,
    floatingRef,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
}) => {
    const {dispatch} = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.multiple_choices}
            description="Display up to 6 options"
            icon={iconByVisualBuilderNodeType.multiple_choices}
            style={colorByVisualBuilderNodeType.multiple_choices}
            onClick={() => {
                dispatch({
                    type: 'INSERT_MULTIPLE_CHOICES_NODE',
                    beforeNodeId: nodeId,
                })
            }}
            floatingRef={floatingRef}
        />
    )
}

const TextReplyMenuItem = ({
    nodeId,
    floatingRef,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
}) => {
    const {dispatch, visualBuilderGraph} = useVisualBuilderContext()
    const {
        isStepUnsupportedInAllChannels,
        getUnsupportedConnectedChannels,
        getSupportedChannels,
    } = useWorkflowChannelSupportContext()

    if (isStepUnsupportedInAllChannels('text_reply')) {
        return null
    }

    const unsupportedConnectedChannels = getUnsupportedConnectedChannels(
        visualBuilderGraph.wfConfigurationOriginal.id,
        'text_reply'
    )
    const supportedChannels = getSupportedChannels('text_reply')

    const disabledText =
        unsupportedConnectedChannels.length > 0
            ? ` This step is currently only supported in ${supportedChannels
                  .map(getChannelName)
                  .join(
                      ' and '
                  )}. Disable the flow in other channels to use this step.`
            : undefined

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.text_reply}
            description="Allow up to 5,000 characters"
            icon={iconByVisualBuilderNodeType.text_reply}
            style={colorByVisualBuilderNodeType.text_reply}
            onClick={() => {
                dispatch({
                    type: 'INSERT_TEXT_REPLY_NODE',
                    beforeNodeId: nodeId,
                })
            }}
            disabledText={disabledText}
            floatingRef={floatingRef}
        />
    )
}

const FileUploadMenuItem = ({
    nodeId,
    floatingRef,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
}) => {
    const {dispatch, visualBuilderGraph} = useVisualBuilderContext()
    const {
        isStepUnsupportedInAllChannels,
        getUnsupportedConnectedChannels,
        getSupportedChannels,
    } = useWorkflowChannelSupportContext()

    if (isStepUnsupportedInAllChannels('file_upload')) {
        return null
    }

    const unsupportedConnectedChannels = getUnsupportedConnectedChannels(
        visualBuilderGraph.wfConfigurationOriginal.id,
        'file_upload'
    )
    const supportedChannels = getSupportedChannels('file_upload')

    const disabledText =
        unsupportedConnectedChannels.length > 0
            ? ` This step is currently only supported in ${supportedChannels
                  .map(getChannelName)
                  .join(
                      ' and '
                  )}. Disable the flow in other channels to use this step.`
            : undefined

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.file_upload}
            description="Allow up to 5 files"
            icon={iconByVisualBuilderNodeType.file_upload}
            style={colorByVisualBuilderNodeType.file_upload}
            onClick={() => {
                dispatch({
                    type: 'INSERT_FILE_UPLOAD_NODE',
                    beforeNodeId: nodeId,
                })
            }}
            disabledText={disabledText}
            floatingRef={floatingRef}
        />
    )
}

const AutomatedMessageMenuItem = ({
    nodeId,
    floatingRef,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
}) => {
    const {dispatch} = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.automated_message}
            description="Display short text"
            icon={iconByVisualBuilderNodeType.automated_message}
            style={colorByVisualBuilderNodeType.automated_message}
            onClick={() => {
                dispatch({
                    type: 'INSERT_AUTOMATED_MESSAGE_NODE',
                    beforeNodeId: nodeId,
                })
            }}
            floatingRef={floatingRef}
        />
    )
}

const ShopperAuthenticationMenuItem = ({
    nodeId,
    floatingRef,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
}) => {
    const storeIntegration = useSelfServiceStoreIntegrationContext()
    const {dispatch, visualBuilderGraph} = useVisualBuilderContext()
    const {
        isStepUnsupportedInAllChannels,
        getUnsupportedConnectedChannels,
        getSupportedChannels,
    } = useWorkflowChannelSupportContext()

    if (isStepUnsupportedInAllChannels('shopper_authentication')) {
        return null
    }

    const unsupportedConnectedChannels = getUnsupportedConnectedChannels(
        visualBuilderGraph.wfConfigurationOriginal.id,
        'shopper_authentication'
    )
    const supportedChannels = getSupportedChannels('shopper_authentication')

    const disabledText =
        unsupportedConnectedChannels.length > 0
            ? ` This step is currently only supported in ${supportedChannels
                  .map(getChannelName)
                  .join(
                      ' and '
                  )}. Disable the flow in other channels to use this step.`
            : undefined

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.shopper_authentication}
            description="Confirm customer identity"
            icon={iconByVisualBuilderNodeType.shopper_authentication}
            style={colorByVisualBuilderNodeType.shopper_authentication}
            onClick={() => {
                dispatch({
                    type: 'INSERT_SHOPPER_AUTHENTICATION_NODE',
                    beforeNodeId: nodeId,
                    storeIntegrationId: storeIntegration.id,
                })
            }}
            disabledText={
                !isNodeUniquePerPath(
                    'shopper_authentication',
                    visualBuilderGraph,
                    nodeId
                )
                    ? 'This step can only be used once per path in a Flow.'
                    : disabledText
            }
            floatingRef={floatingRef}
        />
    )
}

const OrderSelectionMenuItem = ({
    nodeId,
    floatingRef,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
}) => {
    const {dispatch, visualBuilderGraph} = useVisualBuilderContext()
    const {
        isStepUnsupportedInAllChannels,
        getUnsupportedConnectedChannels,
        getSupportedChannels,
    } = useWorkflowChannelSupportContext()

    if (isStepUnsupportedInAllChannels('order_selection')) {
        return null
    }

    const unsupportedConnectedChannels = getUnsupportedConnectedChannels(
        visualBuilderGraph.wfConfigurationOriginal.id,
        'order_selection'
    )
    const supportedChannels = getSupportedChannels('order_selection')

    const disabledText =
        unsupportedConnectedChannels.length > 0
            ? ` This step is currently only supported in ${supportedChannels
                  .map(getChannelName)
                  .join(
                      ' and '
                  )}. Disable the flow in other channels to use this step.`
            : undefined

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.order_selection}
            description="Display last 5 orders"
            icon={iconByVisualBuilderNodeType.order_selection}
            style={colorByVisualBuilderNodeType.order_selection}
            onClick={() => {
                dispatch({
                    type: 'INSERT_ORDER_SELECTION_NODE',
                    beforeNodeId: nodeId,
                })
            }}
            disabledText={
                !hasParentNodeInPath(
                    'shopper_authentication',
                    visualBuilderGraph,
                    nodeId
                )
                    ? 'Add a Customer login step first in order to use this step.'
                    : disabledText
            }
            floatingRef={floatingRef}
        />
    )
}

const OrderLineItemSelectionMenuItem = ({
    nodeId,
    floatingRef,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
}) => {
    const {dispatch, visualBuilderGraph} = useVisualBuilderContext()
    const {
        isStepUnsupportedInAllChannels,
        getUnsupportedConnectedChannels,
        getSupportedChannels,
    } = useWorkflowChannelSupportContext()

    if (isStepUnsupportedInAllChannels('order_line_item_selection')) {
        return null
    }

    const unsupportedConnectedChannels = getUnsupportedConnectedChannels(
        visualBuilderGraph.wfConfigurationOriginal.id,
        'order_line_item_selection'
    )
    const supportedChannels = getSupportedChannels('order_line_item_selection')

    const disabledText =
        unsupportedConnectedChannels.length > 0
            ? ` This step is currently only supported in ${supportedChannels
                  .map(getChannelName)
                  .join(
                      ' and '
                  )}. Disable the flow in other channels to use this step.`
            : undefined

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.order_line_item_selection}
            description="Select an item from an order"
            icon={iconByVisualBuilderNodeType.order_line_item_selection}
            style={colorByVisualBuilderNodeType.order_line_item_selection}
            onClick={() => {
                dispatch({
                    type: 'INSERT_ORDER_LINE_ITEM_SELECTION_NODE',
                    beforeNodeId: nodeId,
                })
            }}
            disabledText={
                !hasParentNodeInPath(
                    'order_selection',
                    visualBuilderGraph,
                    nodeId
                )
                    ? 'Add an Order selection step first in order to use this step.'
                    : disabledText
            }
            floatingRef={floatingRef}
        />
    )
}

const HttpRequestMenuItem = ({
    nodeId,
    floatingRef,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
}) => {
    const {dispatch} = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.http_request}
            description="Perform 3rd party actions"
            icon={iconByVisualBuilderNodeType.http_request}
            style={colorByVisualBuilderNodeType.http_request}
            onClick={() => {
                dispatch({
                    type: 'INSERT_HTTP_REQUEST_NODE',
                    beforeNodeId: nodeId,
                })
            }}
            floatingRef={floatingRef}
        />
    )
}

const ConditionsMenuItem = ({
    nodeId,
    floatingRef,
    disabledText,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
    disabledText?: string
}) => {
    const {dispatch} = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.conditions}
            description="Route customers using variables"
            icon={iconByVisualBuilderNodeType.conditions}
            style={colorByVisualBuilderNodeType.conditions}
            onClick={() => {
                dispatch({
                    type: 'INSERT_CONDITIONS_NODE',
                    beforeNodeId: nodeId,
                })
            }}
            floatingRef={floatingRef}
            disabledText={disabledText}
        />
    )
}

const CancelOrderMenuItem = ({
    nodeId,
    floatingRef,
    customerId,
    orderExternalId,
    integrationId,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
    disabledText?: string
    customerId: string
    orderExternalId: string
    integrationId: string
}) => {
    const {dispatch, visualBuilderGraph} = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.cancel_order}
            description="Cancel order."
            icon={iconByVisualBuilderNodeType.cancel_order}
            style={colorByVisualBuilderNodeType.cancel_order}
            onClick={() => {
                dispatch({
                    type: 'INSERT_CANCEL_ORDER_NODE',
                    beforeNodeId: nodeId,
                    customerId,
                    orderExternalId,
                    integrationId,
                })
            }}
            floatingRef={floatingRef}
            disabledText={
                !isNodeUniquePerPath('cancel_order', visualBuilderGraph, nodeId)
                    ? 'This step can only be used once per path in a Flow.'
                    : !isNodeUniquePerPath(
                            'refund_order',
                            visualBuilderGraph,
                            nodeId
                        ) ||
                        !isNodeUniquePerPath(
                            'update_shipping_address',
                            visualBuilderGraph,
                            nodeId
                        )
                      ? 'This step cannot be used if Refund order or Update shipping address step was already added.'
                      : undefined
            }
        />
    )
}

const RefundOrderMenuItem = ({
    nodeId,
    floatingRef,
    customerId,
    orderExternalId,
    integrationId,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
    customerId: string
    orderExternalId: string
    integrationId: string
}) => {
    const {dispatch, visualBuilderGraph} = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.refund_order}
            description="Refund order."
            icon={iconByVisualBuilderNodeType.refund_order}
            style={colorByVisualBuilderNodeType.refund_order}
            onClick={() => {
                dispatch({
                    type: 'INSERT_REFUND_ORDER_NODE',
                    beforeNodeId: nodeId,
                    customerId,
                    orderExternalId,
                    integrationId,
                })
            }}
            floatingRef={floatingRef}
            disabledText={
                !isNodeUniquePerPath('refund_order', visualBuilderGraph, nodeId)
                    ? 'This step can only be used once per path in a Flow.'
                    : !isNodeUniquePerPath(
                            'cancel_order',
                            visualBuilderGraph,
                            nodeId
                        ) ||
                        !isNodeUniquePerPath(
                            'update_shipping_address',
                            visualBuilderGraph,
                            nodeId
                        )
                      ? 'This step cannot be used if Cancel order or Update shipping address step was already added.'
                      : undefined
            }
        />
    )
}

const UpdateShippingAddressMenuItem = ({
    nodeId,
    floatingRef,
    customerId,
    orderExternalId,
    integrationId,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
    customerId: string
    orderExternalId: string
    integrationId: string
}) => {
    const {dispatch, visualBuilderGraph} = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.update_shipping_address}
            description="Edit order shipping address."
            icon={iconByVisualBuilderNodeType.update_shipping_address}
            style={colorByVisualBuilderNodeType.update_shipping_address}
            onClick={() => {
                dispatch({
                    type: 'INSERT_UPDATE_SHIPPING_ADDRESS_NODE',
                    beforeNodeId: nodeId,
                    customerId,
                    orderExternalId,
                    integrationId,
                })
            }}
            floatingRef={floatingRef}
            disabledText={
                !isNodeUniquePerPath(
                    'update_shipping_address',
                    visualBuilderGraph,
                    nodeId
                )
                    ? 'This step can only be used once per path in a Flow.'
                    : !isNodeUniquePerPath(
                            'refund_order',
                            visualBuilderGraph,
                            nodeId
                        ) ||
                        !isNodeUniquePerPath(
                            'cancel_order',
                            visualBuilderGraph,
                            nodeId
                        )
                      ? 'This step cannot be used if Cancel order or Refund order step was already added.'
                      : undefined
            }
        />
    )
}

const RemoveItemMenuItem = ({
    nodeId,
    floatingRef,
    customerId,
    orderExternalId,
    integrationId,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
    customerId: string
    orderExternalId: string
    integrationId: string
}) => {
    const {dispatch, visualBuilderGraph} = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.remove_item}
            description="Remove order item."
            icon={iconByVisualBuilderNodeType.remove_item}
            style={colorByVisualBuilderNodeType.remove_item}
            onClick={() => {
                dispatch({
                    type: 'INSERT_REMOVE_ITEM_NODE',
                    beforeNodeId: nodeId,
                    customerId,
                    orderExternalId,
                    integrationId,
                })
            }}
            floatingRef={floatingRef}
            disabledText={
                !isNodeUniquePerPath(
                    'refund_order',
                    visualBuilderGraph,
                    nodeId
                ) ||
                !isNodeUniquePerPath('cancel_order', visualBuilderGraph, nodeId)
                    ? 'This step cannot be used if Cancel order or Refund order step was already added.'
                    : undefined
            }
        />
    )
}

const CreateDiscountCodeMenuItem = ({
    nodeId,
    floatingRef,
    customerId,
    integrationId,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
    customerId: string
    integrationId: string
}) => {
    const {dispatch} = useVisualBuilderContext()
    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.create_discount_code}
            description="Create discount code."
            icon={iconByVisualBuilderNodeType.create_discount_code}
            style={colorByVisualBuilderNodeType.create_discount_code}
            onClick={() => {
                dispatch({
                    type: 'INSERT_CREATE_DISCOUNT_CODE_NODE',
                    beforeNodeId: nodeId,
                    customerId,
                    integrationId,
                })
            }}
            floatingRef={floatingRef}
        />
    )
}

const CancelSubscriptionMenuItem = ({
    nodeId,
    floatingRef,
    customerId,
    integrationId,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
    customerId: string
    integrationId: string
}) => {
    const {dispatch, visualBuilderGraph} = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.cancel_subscription}
            description="Cancel active subscription."
            icon={iconByVisualBuilderNodeType.cancel_subscription}
            style={colorByVisualBuilderNodeType.cancel_subscription}
            onClick={() => {
                dispatch({
                    type: 'INSERT_CANCEL_SUBSCRIPTION_NODE',
                    beforeNodeId: nodeId,
                    customerId,
                    integrationId,
                })
            }}
            floatingRef={floatingRef}
            disabledText={
                !isNodeUniquePerPath(
                    'cancel_subscription',
                    visualBuilderGraph,
                    nodeId
                )
                    ? 'This step can only be used once per path in a Flow.'
                    : !isNodeUniquePerPath(
                            'skip_charge',
                            visualBuilderGraph,
                            nodeId
                        )
                      ? 'This step cannot be used if Skip next subscription shipment step was already added.'
                      : undefined
            }
        />
    )
}

const SkipChargeMenuItem = ({
    nodeId,
    floatingRef,
    customerId,
    integrationId,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
    customerId: string
    integrationId: string
}) => {
    const {dispatch, visualBuilderGraph} = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.skip_charge}
            description="Skip next shipment of an ongoing subscription."
            icon={iconByVisualBuilderNodeType.skip_charge}
            style={colorByVisualBuilderNodeType.skip_charge}
            onClick={() => {
                dispatch({
                    type: 'INSERT_SKIP_CHARGE_NODE',
                    beforeNodeId: nodeId,
                    customerId,
                    integrationId,
                })
            }}
            floatingRef={floatingRef}
            disabledText={
                !isNodeUniquePerPath('skip_charge', visualBuilderGraph, nodeId)
                    ? 'This step can only be used once per path in a Flow.'
                    : !isNodeUniquePerPath(
                            'cancel_subscription',
                            visualBuilderGraph,
                            nodeId
                        )
                      ? 'This step cannot be used if Cancel subscription step was already added.'
                      : undefined
            }
        />
    )
}

function useMenuItems(nodeId: string, floatingRef?: HTMLElement | null) {
    const {visualBuilderGraph} = useVisualBuilderContext()

    const triggerNode = visualBuilderGraph.nodes.find(isTriggerNodeType)!

    return useMemo<ReactNode>(() => {
        switch (triggerNode.type) {
            case 'channel_trigger':
                return (
                    <>
                        <MultipleChoicesMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                        <TextReplyMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                        <FileUploadMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                        <AutomatedMessageMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                        <ShopperAuthenticationMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                        <OrderSelectionMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                        <OrderLineItemSelectionMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                        <HttpRequestMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                        <ConditionsMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                            disabledText={
                                !hasParentNodeInPath(
                                    'shopper_authentication',
                                    visualBuilderGraph,
                                    nodeId
                                ) &&
                                !hasParentNodeInPath(
                                    'http_request',
                                    visualBuilderGraph,
                                    nodeId
                                ) &&
                                !hasParentNodeInPath(
                                    'text_reply',
                                    visualBuilderGraph,
                                    nodeId
                                )
                                    ? 'Conditions rely on variables from other steps such as Customer login, Collect text reply, Order selection and HTTP requests.'
                                    : undefined
                            }
                        />
                    </>
                )
            case 'llm_prompt_trigger':
                return (
                    <>
                        <HttpRequestMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                        <ConditionsMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                        {visualBuilderGraph.apps?.some(
                            (app) => app.type === 'shopify'
                        ) && (
                            <>
                                <CancelOrderMenuItem
                                    nodeId={nodeId}
                                    floatingRef={floatingRef}
                                    customerId="{{objects.customer.id}}"
                                    orderExternalId="{{objects.order.external_id}}"
                                    integrationId="{{store.helpdesk_integration_id}}"
                                />
                                <RefundOrderMenuItem
                                    nodeId={nodeId}
                                    floatingRef={floatingRef}
                                    customerId="{{objects.customer.id}}"
                                    orderExternalId="{{objects.order.external_id}}"
                                    integrationId="{{store.helpdesk_integration_id}}"
                                />
                                <UpdateShippingAddressMenuItem
                                    nodeId={nodeId}
                                    floatingRef={floatingRef}
                                    customerId="{{objects.customer.id}}"
                                    orderExternalId="{{objects.order.external_id}}"
                                    integrationId="{{store.helpdesk_integration_id}}"
                                />
                                <RemoveItemMenuItem
                                    nodeId={nodeId}
                                    floatingRef={floatingRef}
                                    customerId="{{objects.customer.id}}"
                                    orderExternalId="{{objects.order.external_id}}"
                                    integrationId="{{store.helpdesk_integration_id}}"
                                />
                                <CreateDiscountCodeMenuItem
                                    nodeId={nodeId}
                                    floatingRef={floatingRef}
                                    customerId="{{objects.customer.id}}"
                                    integrationId="{{store.helpdesk_integration_id}}"
                                />
                            </>
                        )}
                        {visualBuilderGraph.apps?.some(
                            (app) => app.type === 'recharge'
                        ) && (
                            <>
                                <CancelSubscriptionMenuItem
                                    nodeId={nodeId}
                                    floatingRef={floatingRef}
                                    customerId="{{objects.customer.id}}"
                                    integrationId="{{apps.recharge.integration_id}}"
                                />
                                <SkipChargeMenuItem
                                    nodeId={nodeId}
                                    floatingRef={floatingRef}
                                    customerId="{{objects.customer.id}}"
                                    integrationId="{{apps.recharge.integration_id}}"
                                />
                            </>
                        )}
                    </>
                )
        }
    }, [visualBuilderGraph, nodeId, floatingRef, triggerNode.type])
}

export type VisualBuilderEdgeProps = {
    nodeId: string
    isSelected: boolean
    incomingChoice?: {
        label: string
        eventId: string
        nodeId: string
    }
    incomingCondition?: {
        id: string
        label: string
        nodeId: string
        isFallback: boolean
    }
    incomingHttpRequestCondition?: {
        label: string
        nodeId: string
    }
    incomingCancelOrderCondition?: {
        label: string
        nodeId: string
    }
    incomingRefundOrderCondition?: {
        label: string
        nodeId: string
    }
    incomingUpdateShippingAddressCondition?: {
        label: string
        nodeId: string
    }
    incomingRemoveItemCondition?: {
        label: string
        nodeId: string
    }
    incomingCreateDiscountCodeCondition?: {
        label: string
        nodeId: string
    }
    incomingCancelSubscriptionCondition?: {
        label: string
        nodeId: string
    }
    incomingSkipChargeCondition?: {
        label: string
        nodeId: string
    }
} & Pick<VisualBuilderContext, 'dispatch'>

export default function EdgeBlock({
    nodeId,
    incomingChoice,
    incomingCondition,
    incomingHttpRequestCondition,
    incomingCancelOrderCondition,
    incomingRefundOrderCondition,
    incomingUpdateShippingAddressCondition,
    incomingRemoveItemCondition,
    incomingCreateDiscountCodeCondition,
    incomingCancelSubscriptionCondition,
    incomingSkipChargeCondition,
    isSelected,
    dispatch,
}: VisualBuilderEdgeProps) {
    const edgeRef = useRef<HTMLDivElement>(null)
    const [floatingRef, setFloatingRef] = useState<HTMLElement | null>(null)
    const onFloatingRefChange = useCallback((node: HTMLElement | null) => {
        setFloatingRef(node)
    }, [])
    const [isNodeMenuDropdownOpen, setIsNodeMenuDropdownOpen] = useState(false)
    const {visualBuilderGraph} = useVisualBuilderContext()

    const menuItems = useMenuItems(nodeId, floatingRef?.parentElement)

    return (
        <div
            className={css.addNodeIconContainer}
            onClick={(e) => {
                e.stopPropagation()
            }}
            style={{
                top:
                    incomingChoice ||
                    incomingCondition ||
                    incomingHttpRequestCondition ||
                    incomingCancelOrderCondition ||
                    incomingRefundOrderCondition ||
                    incomingUpdateShippingAddressCondition ||
                    incomingRemoveItemCondition ||
                    incomingCreateDiscountCodeCondition ||
                    incomingCancelSubscriptionCondition ||
                    incomingSkipChargeCondition
                        ? -48
                        : -46,
            }}
        >
            {incomingChoice && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingChoice.nodeId,
                        })
                        dispatch({
                            type: 'SET_CHOICE_EVENT_EDITING_ID',
                            eventId: incomingChoice.eventId,
                        })
                    }}
                    isSelected={isSelected}
                    type="choice"
                >
                    {incomingChoice.label}
                </EdgeLabel>
            )}
            {incomingHttpRequestCondition && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingHttpRequestCondition.nodeId,
                        })
                    }}
                    isSelected={isSelected}
                    type="http_request"
                >
                    {incomingHttpRequestCondition.label}
                </EdgeLabel>
            )}
            {incomingCancelOrderCondition && (
                <EdgeLabel isSelected={isSelected} type="cancel_order">
                    {incomingCancelOrderCondition.label}
                </EdgeLabel>
            )}
            {incomingRefundOrderCondition && (
                <EdgeLabel isSelected={isSelected} type="refund_order">
                    {incomingRefundOrderCondition.label}
                </EdgeLabel>
            )}
            {incomingUpdateShippingAddressCondition && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingUpdateShippingAddressCondition.nodeId,
                        })
                    }}
                    isSelected={isSelected}
                    type="update_shipping_address"
                >
                    {incomingUpdateShippingAddressCondition.label}
                </EdgeLabel>
            )}
            {incomingRemoveItemCondition && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingRemoveItemCondition.nodeId,
                        })
                    }}
                    isSelected={isSelected}
                    type="remove_item"
                >
                    {incomingRemoveItemCondition.label}
                </EdgeLabel>
            )}
            {incomingCreateDiscountCodeCondition && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingCreateDiscountCodeCondition.nodeId,
                        })
                    }}
                    isSelected={isSelected}
                    type="create_discount_code"
                >
                    {incomingCreateDiscountCodeCondition.label}
                </EdgeLabel>
            )}
            {incomingCancelSubscriptionCondition && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingCancelSubscriptionCondition.nodeId,
                        })
                    }}
                    isSelected={isSelected}
                    type="cancel_subscription"
                >
                    {incomingCancelSubscriptionCondition.label}
                </EdgeLabel>
            )}
            {incomingSkipChargeCondition && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingSkipChargeCondition.nodeId,
                        })
                    }}
                    isSelected={isSelected}
                    type="skip_charge"
                >
                    {incomingSkipChargeCondition.label}
                </EdgeLabel>
            )}
            {incomingCondition && (
                <EdgeLabel
                    type="condition"
                    onClick={() => {
                        if (
                            visualBuilderGraph.nodeEditingId !==
                            incomingCondition.nodeId
                        ) {
                            dispatch({
                                type: 'SET_NODE_EDITING_ID',
                                nodeId: incomingCondition.nodeId,
                            })

                            if (!incomingCondition.isFallback) {
                                dispatch({
                                    type: 'SET_BRANCH_IDS_EDITING',
                                    branchIds: [incomingCondition.id],
                                })
                            }
                        } else if (!incomingCondition.isFallback) {
                            dispatch({
                                type: 'ADD_BRANCH_ID_EDITING',
                                branchId: incomingCondition.id,
                            })
                        }
                    }}
                    isSelected={isSelected}
                >
                    {incomingCondition.label}
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
                <DropdownBody>{menuItems}</DropdownBody>
            </Dropdown>
        </div>
    )
}
