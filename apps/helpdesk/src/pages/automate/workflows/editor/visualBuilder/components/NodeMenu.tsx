import React, {
    Dispatch,
    forwardRef,
    ReactNode,
    Ref,
    RefObject,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'

import _isNil from 'lodash/isNil'
import { DropdownItem } from 'reactstrap'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import AppIcon from 'pages/automate/actionsPlatform/components/AppIcon'
import useEnabledActionStepsByApp from 'pages/automate/actionsPlatform/hooks/useEnabledActionStepsByApp'
import { useSelfServiceStoreIntegrationContext } from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import VisualBuilderActionIcon from 'pages/automate/workflows/components/VisualBuilderActionIcon'
import { labelByVisualBuilderNodeType } from 'pages/automate/workflows/constants'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    getChannelName,
    useWorkflowChannelSupportContext,
} from 'pages/automate/workflows/hooks/useWorkflowChannelSupport'
import {
    hasParentNodeInPath,
    isNodeUniquePerPath,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {
    ReusableLLMPromptTrigger,
    WorkflowConfiguration,
} from 'pages/automate/workflows/models/workflowConfiguration.types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'

import { Components } from '../../../../../../rest_api/workflows_api/client.generated'
import { App } from '../../../../actionsPlatform/types'
import MenuCategoryItem from './MenuCategoryItem'
import MenuItem from './MenuItem'

import css from './NodeMenu.less'

const MultipleChoicesMenuItem = ({
    nodeId,
    floatingRef,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
}) => {
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.multiple_choices}
            description="Display up to 6 options"
            icon={<VisualBuilderActionIcon nodeType="multiple_choices" />}
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
    const { dispatch, visualBuilderGraph } = useVisualBuilderContext()
    const {
        isStepUnsupportedInAllChannels,
        getUnsupportedConnectedChannels,
        getSupportedChannels,
    } = useWorkflowChannelSupportContext()

    if (isStepUnsupportedInAllChannels('text_reply')) {
        return null
    }

    const unsupportedConnectedChannels = getUnsupportedConnectedChannels(
        visualBuilderGraph.id,
        'text_reply',
    )
    const supportedChannels = getSupportedChannels('text_reply')

    const disabledText =
        unsupportedConnectedChannels.length > 0
            ? ` This step is currently only supported in ${supportedChannels
                  .map(getChannelName)
                  .join(
                      ' and ',
                  )}. Disable the flow in other channels to use this step.`
            : undefined

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.text_reply}
            description="Allow up to 5,000 characters"
            icon={<VisualBuilderActionIcon nodeType="text_reply" />}
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
    const { dispatch, visualBuilderGraph } = useVisualBuilderContext()
    const {
        isStepUnsupportedInAllChannels,
        getUnsupportedConnectedChannels,
        getSupportedChannels,
    } = useWorkflowChannelSupportContext()

    if (isStepUnsupportedInAllChannels('file_upload')) {
        return null
    }

    const unsupportedConnectedChannels = getUnsupportedConnectedChannels(
        visualBuilderGraph.id,
        'file_upload',
    )
    const supportedChannels = getSupportedChannels('file_upload')

    const disabledText =
        unsupportedConnectedChannels.length > 0
            ? ` This step is currently only supported in ${supportedChannels
                  .map(getChannelName)
                  .join(
                      ' and ',
                  )}. Disable the flow in other channels to use this step.`
            : undefined

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.file_upload}
            description="Allow up to 5 files"
            icon={<VisualBuilderActionIcon nodeType="file_upload" />}
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
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.automated_message}
            description="Display short text"
            icon={<VisualBuilderActionIcon nodeType="automated_message" />}
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
    const { dispatch, visualBuilderGraph } = useVisualBuilderContext()
    const {
        isStepUnsupportedInAllChannels,
        getUnsupportedConnectedChannels,
        getSupportedChannels,
    } = useWorkflowChannelSupportContext()

    if (isStepUnsupportedInAllChannels('shopper_authentication')) {
        return null
    }

    const unsupportedConnectedChannels = getUnsupportedConnectedChannels(
        visualBuilderGraph.id,
        'shopper_authentication',
    )
    const supportedChannels = getSupportedChannels('shopper_authentication')

    const disabledText =
        unsupportedConnectedChannels.length > 0
            ? ` This step is currently only supported in ${supportedChannels
                  .map(getChannelName)
                  .join(
                      ' and ',
                  )}. Disable the flow in other channels to use this step.`
            : undefined

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.shopper_authentication}
            description="Confirm customer identity"
            icon={<VisualBuilderActionIcon nodeType="shopper_authentication" />}
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
                    nodeId,
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
    const { dispatch, visualBuilderGraph } = useVisualBuilderContext()
    const {
        isStepUnsupportedInAllChannels,
        getUnsupportedConnectedChannels,
        getSupportedChannels,
    } = useWorkflowChannelSupportContext()

    if (isStepUnsupportedInAllChannels('order_selection')) {
        return null
    }

    const unsupportedConnectedChannels = getUnsupportedConnectedChannels(
        visualBuilderGraph.id,
        'order_selection',
    )
    const supportedChannels = getSupportedChannels('order_selection')

    const disabledText =
        unsupportedConnectedChannels.length > 0
            ? ` This step is currently only supported in ${supportedChannels
                  .map(getChannelName)
                  .join(
                      ' and ',
                  )}. Disable the flow in other channels to use this step.`
            : undefined

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.order_selection}
            description="Display last 5 orders"
            icon={<VisualBuilderActionIcon nodeType="order_selection" />}
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
                    nodeId,
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
    const { dispatch, visualBuilderGraph } = useVisualBuilderContext()
    const {
        isStepUnsupportedInAllChannels,
        getUnsupportedConnectedChannels,
        getSupportedChannels,
    } = useWorkflowChannelSupportContext()

    if (isStepUnsupportedInAllChannels('order_line_item_selection')) {
        return null
    }

    const unsupportedConnectedChannels = getUnsupportedConnectedChannels(
        visualBuilderGraph.id,
        'order_line_item_selection',
    )
    const supportedChannels = getSupportedChannels('order_line_item_selection')

    const disabledText =
        unsupportedConnectedChannels.length > 0
            ? ` This step is currently only supported in ${supportedChannels
                  .map(getChannelName)
                  .join(
                      ' and ',
                  )}. Disable the flow in other channels to use this step.`
            : undefined

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.order_line_item_selection}
            description="Select an item from an order"
            icon={
                <VisualBuilderActionIcon nodeType="order_line_item_selection" />
            }
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
                    nodeId,
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
    description,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
    description?: string
}) => {
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.http_request}
            description={description}
            icon={<VisualBuilderActionIcon nodeType="http_request" />}
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

const LiquidTemplateMenuItem = ({
    nodeId,
    floatingRef,
    description,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
    description?: string
}) => {
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.liquid_template}
            description={description}
            icon={<VisualBuilderActionIcon nodeType="liquid_template" />}
            onClick={() => {
                dispatch({
                    type: 'INSERT_LIQUID_TEMPLATE_NODE',
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
    description,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
    disabledText?: string
    description?: string
}) => {
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.conditions}
            description={description}
            icon={<VisualBuilderActionIcon nodeType="conditions" />}
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

const ChannelTriggerConditionsMenuItem = ({
    nodeId,
    floatingRef,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
}) => {
    const { visualBuilderGraph } = useVisualBuilderContext()

    return (
        <ConditionsMenuItem
            nodeId={nodeId}
            floatingRef={floatingRef}
            disabledText={
                !hasParentNodeInPath(
                    'shopper_authentication',
                    visualBuilderGraph,
                    nodeId,
                ) &&
                !hasParentNodeInPath(
                    'http_request',
                    visualBuilderGraph,
                    nodeId,
                ) &&
                !hasParentNodeInPath('text_reply', visualBuilderGraph, nodeId)
                    ? 'Conditions rely on variables from other steps such as Customer login, Collect text reply, Order selection and HTTP requests.'
                    : undefined
            }
            description="Route customers using variables"
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
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.cancel_order}
            icon={<VisualBuilderActionIcon nodeType="cancel_order" />}
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
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.refund_order}
            icon={<VisualBuilderActionIcon nodeType="refund_order" />}
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
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.update_shipping_address}
            icon={
                <VisualBuilderActionIcon nodeType="update_shipping_address" />
            }
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
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.remove_item}
            icon={<VisualBuilderActionIcon nodeType="remove_item" />}
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
        />
    )
}
const ReplaceItemMenuItem = ({
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
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.replace_item}
            icon={<VisualBuilderActionIcon nodeType="replace_item" />}
            onClick={() => {
                dispatch({
                    type: 'INSERT_REPLACE_ITEM_NODE',
                    beforeNodeId: nodeId,
                    customerId,
                    orderExternalId,
                    integrationId,
                })
            }}
            floatingRef={floatingRef}
        />
    )
}

const CreateDiscountCodeMenuItem = ({
    nodeId,
    floatingRef,
    integrationId,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
    integrationId: string
}) => {
    const { dispatch } = useVisualBuilderContext()
    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.create_discount_code}
            icon={<VisualBuilderActionIcon nodeType="create_discount_code" />}
            onClick={() => {
                dispatch({
                    type: 'INSERT_CREATE_DISCOUNT_CODE_NODE',
                    beforeNodeId: nodeId,
                    integrationId,
                })
            }}
            floatingRef={floatingRef}
        />
    )
}

const ReshipForFreeMenuItem = ({
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
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.reship_for_free}
            icon={<VisualBuilderActionIcon nodeType="reship_for_free" />}
            onClick={() => {
                dispatch({
                    type: 'INSERT_RESHIP_FOR_FREE_NODE',
                    beforeNodeId: nodeId,
                    customerId,
                    orderExternalId,
                    integrationId,
                })
            }}
            floatingRef={floatingRef}
        />
    )
}

const RefundShippingCostsMenuItem = ({
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
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.refund_shipping_costs}
            icon={<VisualBuilderActionIcon nodeType="refund_shipping_costs" />}
            onClick={() => {
                dispatch({
                    type: 'INSERT_REFUND_SHIPPING_COSTS_NODE',
                    beforeNodeId: nodeId,
                    customerId,
                    orderExternalId,
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
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.cancel_subscription}
            icon={<VisualBuilderActionIcon nodeType="cancel_subscription" />}
            onClick={() => {
                dispatch({
                    type: 'INSERT_CANCEL_SUBSCRIPTION_NODE',
                    beforeNodeId: nodeId,
                    customerId,
                    integrationId,
                })
            }}
            floatingRef={floatingRef}
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
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.skip_charge}
            icon={<VisualBuilderActionIcon nodeType="skip_charge" />}
            onClick={() => {
                dispatch({
                    type: 'INSERT_SKIP_CHARGE_NODE',
                    beforeNodeId: nodeId,
                    customerId,
                    integrationId,
                })
            }}
            floatingRef={floatingRef}
        />
    )
}

const EditOrderNoteMenuItem = ({
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
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={labelByVisualBuilderNodeType.edit_order_note}
            icon={<VisualBuilderActionIcon nodeType="edit_order_note" />}
            onClick={() => {
                dispatch({
                    type: 'INSERT_EDIT_ORDER_NOTE_NODE',
                    beforeNodeId: nodeId,
                    customerId,
                    orderExternalId,
                    integrationId,
                })
            }}
            floatingRef={floatingRef}
        />
    )
}

const LLMPromptTemplateShopifyMenuItems = ({
    nodeId,
    floatingRef,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
}) => {
    const { visualBuilderGraph } = useVisualBuilderContext()

    if (!visualBuilderGraph.apps?.some((app) => app.type === 'shopify')) {
        return null
    }

    return (
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
            <EditOrderNoteMenuItem
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
            <ReplaceItemMenuItem
                nodeId={nodeId}
                floatingRef={floatingRef}
                customerId="{{objects.customer.id}}"
                orderExternalId="{{objects.order.external_id}}"
                integrationId="{{store.helpdesk_integration_id}}"
            />
            <CreateDiscountCodeMenuItem
                nodeId={nodeId}
                floatingRef={floatingRef}
                integrationId="{{store.helpdesk_integration_id}}"
            />
            <ReshipForFreeMenuItem
                nodeId={nodeId}
                floatingRef={floatingRef}
                customerId="{{objects.customer.id}}"
                orderExternalId="{{objects.order.external_id}}"
                integrationId="{{store.helpdesk_integration_id}}"
            />
            <RefundShippingCostsMenuItem
                nodeId={nodeId}
                floatingRef={floatingRef}
                customerId="{{objects.customer.id}}"
                orderExternalId="{{objects.order.external_id}}"
                integrationId="{{store.helpdesk_integration_id}}"
            />
        </>
    )
}

const LLMPromptTemplateRechargeMenuItems = ({
    nodeId,
    floatingRef,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
}) => {
    const { visualBuilderGraph } = useVisualBuilderContext()

    if (!visualBuilderGraph.apps?.some((app) => app.type === 'recharge')) {
        return null
    }

    return (
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
    )
}

const ReusableLLMPromptCallMenuItem = ({
    nodeId,
    icon,
    label,
    configurationId,
    configurationInternalId,
    trigger,
    entrypoint,
    app,
    values,
}: {
    nodeId: string
    icon: ReactNode
    label: string
    configurationId: string
    configurationInternalId: string
    trigger: Extract<
        NonNullable<WorkflowConfiguration['triggers']>[number],
        { kind: 'reusable-llm-prompt' }
    >['settings']
    entrypoint: Extract<
        NonNullable<WorkflowConfiguration['entrypoints']>[number],
        { kind: 'reusable-llm-prompt-call-step' }
    >['settings']
    app: NonNullable<WorkflowConfiguration['apps']>[number]
    values: WorkflowConfiguration['values']
}) => {
    const { dispatch } = useVisualBuilderContext()

    return (
        <MenuItem
            label={label}
            icon={icon}
            onClick={() => {
                dispatch({
                    type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
                    beforeNodeId: nodeId,
                    configurationId,
                    configurationInternalId,
                    trigger,
                    entrypoint,
                    app,
                    values,
                })
            }}
        />
    )
}

const AppCategoryItem = ({
    app,
    steps,
    setMenuItems,
    nodeId,
}: {
    app: App
    steps: Components.Schemas.ListWfConfigurationTemplatesResponseDto
    setMenuItems: Dispatch<SetStateAction<ReactNode>>
    nodeId: string
}) => {
    const handleClick = useCallback(() => {
        setMenuItems((prevState) => (
            <>
                <DropdownHeader
                    prefix={<i className="material-icons">arrow_back</i>}
                    onClick={() => {
                        setMenuItems(prevState)
                    }}
                    className={css.header}
                >
                    {app.name}
                </DropdownHeader>
                <DropdownBody>
                    {steps.map((step) => (
                        <ReusableLLMPromptCallMenuItem
                            key={step.id}
                            nodeId={nodeId}
                            label={step.name}
                            icon={<AppIcon icon={app.icon} name={app.name} />}
                            configurationId={step.id}
                            configurationInternalId={step.internal_id}
                            trigger={
                                step.triggers[0]
                                    .settings as ReusableLLMPromptTrigger['settings']
                            }
                            entrypoint={step.entrypoints[0].settings}
                            app={step.apps[0]}
                            values={step.values}
                        />
                    ))}
                </DropdownBody>
            </>
        ))
    }, [app, nodeId, setMenuItems, steps])

    return (
        <MenuCategoryItem
            key={app?.id}
            icon={<AppIcon icon={app?.icon} name={app?.name} />}
            label={app?.name}
            onClick={handleClick}
        />
    )
}

const AppMenuCategoryItems = ({
    nodeId,
    setMenuItems,
}: {
    nodeId: string
    setMenuItems: Dispatch<SetStateAction<ReactNode>>
}) => {
    const { visualBuilderGraph } = useVisualBuilderContext()

    const { stepsByUsefulness, appsById } = useEnabledActionStepsByApp(
        visualBuilderGraph.isTemplate,
    )
    return (
        <>
            {stepsByUsefulness.used.length > 0 && (
                <DropdownItem header className="text-uppercase">
                    Relevant for you
                </DropdownItem>
            )}
            {stepsByUsefulness.used.map(([appId, steps]) => (
                <AppCategoryItem
                    key={appId}
                    nodeId={nodeId}
                    setMenuItems={setMenuItems}
                    app={appsById[appId]}
                    steps={steps}
                />
            ))}
            {stepsByUsefulness.unused.length > 0 && (
                <DropdownItem header className="text-uppercase">
                    Other Apps
                </DropdownItem>
            )}
            {stepsByUsefulness.unused.map(([appId, steps]) => (
                <AppCategoryItem
                    key={appId}
                    nodeId={nodeId}
                    setMenuItems={setMenuItems}
                    app={appsById[appId]}
                    steps={steps}
                />
            ))}
        </>
    )
}

type LiquidTemplateStepFlag = {
    actions: boolean
    actionsPlatform: boolean
    flows: boolean
}

function useMenuItems(nodeId: string, floatingRef?: HTMLElement | null) {
    const { visualBuilderGraph } = useVisualBuilderContext()

    const triggerNode = visualBuilderGraph.nodes[0]

    const liquidTemplateStepFlag = useFlag<LiquidTemplateStepFlag>(
        FeatureFlagKey.LiquidTemplateStep,
        {
            actions: false,
            actionsPlatform: false,
            flows: false,
        },
    )

    const [menuItems, setMenuItems] = useState<ReactNode>(null)

    const initialMenuItems = useMemo<ReactNode>(() => {
        switch (triggerNode.type) {
            case 'channel_trigger':
                return (
                    <DropdownBody>
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
                            description="Perform 3rd party actions"
                        />
                        {liquidTemplateStepFlag?.flows && (
                            <LiquidTemplateMenuItem
                                nodeId={nodeId}
                                floatingRef={floatingRef}
                                description="Use Liquid templates to transform data"
                            />
                        )}
                        <ChannelTriggerConditionsMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                    </DropdownBody>
                )
            case 'reusable_llm_prompt_trigger':
                return (
                    <DropdownBody>
                        <HttpRequestMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                        {liquidTemplateStepFlag?.actionsPlatform && (
                            <LiquidTemplateMenuItem
                                nodeId={nodeId}
                                floatingRef={floatingRef}
                                description="Use Liquid templates to transform data"
                            />
                        )}

                        <ConditionsMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />

                        <LLMPromptTemplateShopifyMenuItems
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                        <LLMPromptTemplateRechargeMenuItems
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                    </DropdownBody>
                )
            case 'llm_prompt_trigger':
                return (
                    <DropdownBody>
                        {!!visualBuilderGraph.advanced_datetime && (
                            <>
                                <DropdownItem header className="text-uppercase">
                                    Custom
                                </DropdownItem>
                                <HttpRequestMenuItem
                                    nodeId={nodeId}
                                    floatingRef={floatingRef}
                                />
                                <ConditionsMenuItem
                                    nodeId={nodeId}
                                    floatingRef={floatingRef}
                                />
                            </>
                        )}
                        {visualBuilderGraph.isTemplate &&
                            _isNil(visualBuilderGraph.category) && (
                                <>
                                    <LLMPromptTemplateShopifyMenuItems
                                        nodeId={nodeId}
                                        floatingRef={floatingRef}
                                    />
                                    <LLMPromptTemplateRechargeMenuItems
                                        nodeId={nodeId}
                                        floatingRef={floatingRef}
                                    />
                                </>
                            )}
                        <AppMenuCategoryItems
                            nodeId={nodeId}
                            setMenuItems={setMenuItems}
                        />
                    </DropdownBody>
                )
        }
    }, [
        visualBuilderGraph.isTemplate,
        nodeId,
        floatingRef,
        triggerNode.type,
        visualBuilderGraph.advanced_datetime,
        visualBuilderGraph.category,
        liquidTemplateStepFlag?.flows,
        liquidTemplateStepFlag?.actionsPlatform,
    ])

    useEffect(() => {
        setMenuItems(initialMenuItems)
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [
        visualBuilderGraph.isTemplate,
        nodeId,
        floatingRef,
        triggerNode.type,
        visualBuilderGraph.nodes.length,
    ]) /* eslint-enable react-hooks/exhaustive-deps */

    return menuItems
}

type Props = {
    nodeId: string
    isOpen: boolean
    onToggle: (isOpen: boolean) => void
    target: RefObject<HTMLElement | null>
    floatingRef?: HTMLElement | null
    placement: 'right-start' | 'bottom-start'
}

const NodeMenu = (
    { nodeId, isOpen, onToggle, target, floatingRef, placement }: Props,
    ref: Ref<HTMLElement> | null | undefined,
) => {
    const menuItems = useMenuItems(nodeId, floatingRef)

    return (
        <Dropdown
            ref={ref}
            isOpen={isOpen}
            onToggle={onToggle}
            target={target}
            placement={placement}
            className={css.container}
        >
            {menuItems}
        </Dropdown>
    )
}

export default forwardRef<HTMLElement, Props>(NodeMenu)
