import {useFlags} from 'launchdarkly-react-client-sdk'
import _ from 'lodash'
import _groupBy from 'lodash/groupBy'
import _keyBy from 'lodash/keyBy'
import React, {
    Dispatch,
    ReactNode,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import {useStoreAppsContext} from 'pages/automate/actions/providers/StoreAppsContext'
import AppIcon from 'pages/automate/actionsPlatform/components/AppIcon'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import {ActionTemplate} from 'pages/automate/actionsPlatform/types'
import {useSelfServiceStoreIntegrationContext} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import VisualBuilderActionIcon from 'pages/automate/workflows/components/VisualBuilderActionIcon'
import {labelByVisualBuilderNodeType} from 'pages/automate/workflows/constants'
import {
    useVisualBuilderContext,
    VisualBuilderContextType,
} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    getChannelName,
    useWorkflowChannelSupportContext,
} from 'pages/automate/workflows/hooks/useWorkflowChannelSupport'
import {
    hasParentNodeInPath,
    isNodeUniquePerPath,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'

import css from './EdgeBlock.less'
import EdgeBlockMenuCategoryItem from './EdgeBlockMenuCategoryItem'
import EdgeBlockMenuItem from './EdgeBlockMenuItem'
import EdgeBlockMenuSkeletonItem from './EdgeBlockMenuSkeletonItem'
import EdgeIconButton from './EdgeIconButton'
import EdgeLabel from './EdgeLabel'

const MultipleChoicesMenuItem = ({
    nodeId,
    floatingRef,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
}) => {
    const {dispatch} = useVisualBuilderContext()

    return (
        <EdgeBlockMenuItem
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
        visualBuilderGraph.id,
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
        <EdgeBlockMenuItem
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
        visualBuilderGraph.id,
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
        <EdgeBlockMenuItem
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
    const {dispatch} = useVisualBuilderContext()

    return (
        <EdgeBlockMenuItem
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
        visualBuilderGraph.id,
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
        <EdgeBlockMenuItem
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
        visualBuilderGraph.id,
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
        <EdgeBlockMenuItem
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
        visualBuilderGraph.id,
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
        <EdgeBlockMenuItem
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
    description,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
    description?: string
}) => {
    const {dispatch} = useVisualBuilderContext()

    return (
        <EdgeBlockMenuItem
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
    const {dispatch} = useVisualBuilderContext()

    return (
        <EdgeBlockMenuItem
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
    const {visualBuilderGraph} = useVisualBuilderContext()

    return (
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
    const {dispatch} = useVisualBuilderContext()

    return (
        <EdgeBlockMenuItem
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
    const {dispatch} = useVisualBuilderContext()

    return (
        <EdgeBlockMenuItem
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
    const {dispatch} = useVisualBuilderContext()

    return (
        <EdgeBlockMenuItem
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
    const {dispatch} = useVisualBuilderContext()

    return (
        <EdgeBlockMenuItem
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
    const {dispatch} = useVisualBuilderContext()

    return (
        <EdgeBlockMenuItem
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
        <EdgeBlockMenuItem
            label={labelByVisualBuilderNodeType.create_discount_code}
            icon={<VisualBuilderActionIcon nodeType="create_discount_code" />}
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
    const {dispatch} = useVisualBuilderContext()

    return (
        <EdgeBlockMenuItem
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
    const {dispatch} = useVisualBuilderContext()

    return (
        <EdgeBlockMenuItem
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
    const {dispatch} = useVisualBuilderContext()

    return (
        <EdgeBlockMenuItem
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
    const {dispatch} = useVisualBuilderContext()

    return (
        <EdgeBlockMenuItem
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

const LLMPromptTemplateShopifyMenuItems = ({
    nodeId,
    floatingRef,
}: {
    nodeId: string
    floatingRef?: HTMLElement | null
}) => {
    const {visualBuilderGraph} = useVisualBuilderContext()

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
                customerId="{{objects.customer.id}}"
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
    const {visualBuilderGraph} = useVisualBuilderContext()

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
        {kind: 'reusable-llm-prompt'}
    >['settings']
    entrypoint: Extract<
        NonNullable<WorkflowConfiguration['entrypoints']>[number],
        {kind: 'reusable-llm-prompt-call-step'}
    >['settings']
    app: NonNullable<WorkflowConfiguration['apps']>[number]
    values: WorkflowConfiguration['values']
}) => {
    const {dispatch} = useVisualBuilderContext()

    return (
        <EdgeBlockMenuItem
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

const AppMenuCategoryItems = ({
    nodeId,
    setMenuItems,
}: {
    nodeId: string
    setMenuItems: Dispatch<SetStateAction<ReactNode>>
}) => {
    const enabledSteps:
        | ActionTemplate['internal_id'][]
        | Record<never, never>
        | undefined = useFlags()[FeatureFlagKey.ActionSteps]

    const {visualBuilderGraph} = useVisualBuilderContext()
    const {data: steps = []} = useGetWorkflowConfigurationTemplates({
        triggers: ['reusable-llm-prompt'],
    })
    const {apps} = useApps()
    const {recharge: rechargeIntegration} = useStoreAppsContext()

    const appsById = _keyBy(apps, 'id')

    const stepsByApp = useMemo(
        () =>
            _groupBy(steps, (step) => {
                if (
                    Array.isArray(enabledSteps) &&
                    !!enabledSteps.includes(step.internal_id)
                ) {
                    return null
                }

                switch (step.apps[0].type) {
                    case 'shopify':
                    case 'recharge':
                        return step.apps[0].type
                    case 'app':
                        return step.apps[0].app_id
                }
            }),
        [steps, enabledSteps]
    )

    return (
        <>
            {Object.entries(stepsByApp).map(([appId, steps]) => {
                const app = appsById[appId]

                if (
                    visualBuilderGraph.isTemplate &&
                    !visualBuilderGraph.apps?.some((templateApp) => {
                        switch (templateApp.type) {
                            case 'shopify':
                            case 'recharge':
                                return templateApp.type === app.type
                            case 'app':
                                return (
                                    templateApp.type === app.type &&
                                    templateApp.app_id === app.id
                                )
                        }
                    })
                ) {
                    return null
                }

                if (!app) {
                    return <EdgeBlockMenuSkeletonItem />
                }

                if (
                    app.type === 'recharge' &&
                    !visualBuilderGraph.isTemplate &&
                    !rechargeIntegration
                ) {
                    return null
                }

                return (
                    <EdgeBlockMenuCategoryItem
                        key={appId}
                        icon={<AppIcon icon={app.icon} name={app.name} />}
                        label={app.name}
                        onClick={() => {
                            setMenuItems((prevState) => (
                                <>
                                    <DropdownHeader
                                        prefix={
                                            <i className="material-icons">
                                                arrow_back
                                            </i>
                                        }
                                        onClick={() => {
                                            setMenuItems(prevState)
                                        }}
                                        className={css.header}
                                    >
                                        {app.name}
                                    </DropdownHeader>
                                    <DropdownBody>
                                        {steps
                                            .map((step) =>
                                                _.isEmpty(
                                                    step.triggers[0].settings
                                                ) ? null : (
                                                    <ReusableLLMPromptCallMenuItem
                                                        key={step.id}
                                                        nodeId={nodeId}
                                                        label={step.name}
                                                        icon={
                                                            <AppIcon
                                                                icon={app.icon}
                                                                name={app.name}
                                                            />
                                                        }
                                                        configurationId={
                                                            step.id
                                                        }
                                                        configurationInternalId={
                                                            step.internal_id
                                                        }
                                                        trigger={
                                                            step.triggers[0]
                                                                .settings as Extract<
                                                                NonNullable<
                                                                    WorkflowConfiguration['triggers']
                                                                >[number],
                                                                {
                                                                    kind: 'reusable-llm-prompt'
                                                                }
                                                            >['settings']
                                                        }
                                                        entrypoint={
                                                            step.entrypoints[0]
                                                                .settings
                                                        }
                                                        app={step.apps[0]}
                                                        values={step.values}
                                                    />
                                                )
                                            )
                                            .filter(Boolean)}
                                    </DropdownBody>
                                </>
                            ))
                        }}
                    />
                )
            })}
        </>
    )
}

function useMenuItems(nodeId: string, floatingRef?: HTMLElement | null) {
    const {visualBuilderGraph} = useVisualBuilderContext()

    const triggerNode = visualBuilderGraph.nodes[0]

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
                        <HttpRequestMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                        <ConditionsMenuItem
                            nodeId={nodeId}
                            floatingRef={floatingRef}
                        />
                        {visualBuilderGraph.isTemplate && (
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
    }, [visualBuilderGraph.isTemplate, nodeId, floatingRef, triggerNode.type])

    useEffect(() => {
        setMenuItems(initialMenuItems)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visualBuilderGraph.isTemplate, nodeId, floatingRef, triggerNode.type])

    return menuItems
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
    incomingReplaceItemCondition?: {
        label: string
        nodeId: string
    }
    incomingCreateDiscountCodeCondition?: {
        label: string
        nodeId: string
    }
    incomingReshipForFreeCondition?: {
        label: string
        nodeId: string
    }
    incomingRefundShippingCostsCondition?: {
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
    incomingReusableLLMPromptCallCondition?: {
        label: string
        nodeId: string
        isClickable: boolean
    }
} & Pick<VisualBuilderContextType, 'dispatch'>

export default function EdgeBlock({
    nodeId,
    incomingChoice,
    incomingCondition,
    incomingHttpRequestCondition,
    incomingCancelOrderCondition,
    incomingRefundOrderCondition,
    incomingUpdateShippingAddressCondition,
    incomingRemoveItemCondition,
    incomingReplaceItemCondition,
    incomingCreateDiscountCodeCondition,
    incomingRefundShippingCostsCondition,
    incomingReshipForFreeCondition,
    incomingCancelSubscriptionCondition,
    incomingSkipChargeCondition,
    incomingReusableLLMPromptCallCondition,
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
                    incomingReplaceItemCondition ||
                    incomingCreateDiscountCodeCondition ||
                    incomingReshipForFreeCondition ||
                    incomingRefundShippingCostsCondition ||
                    incomingCancelSubscriptionCondition ||
                    incomingSkipChargeCondition ||
                    incomingReusableLLMPromptCallCondition
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
            {incomingReplaceItemCondition && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingReplaceItemCondition.nodeId,
                        })
                    }}
                    isSelected={isSelected}
                    type="replace_item"
                >
                    {incomingReplaceItemCondition.label}
                </EdgeLabel>
            )}
            {incomingCreateDiscountCodeCondition && (
                <EdgeLabel isSelected={isSelected} type="create_discount_code">
                    {incomingCreateDiscountCodeCondition.label}
                </EdgeLabel>
            )}
            {incomingReshipForFreeCondition && (
                <EdgeLabel isSelected={isSelected} type="reship_for_free">
                    {incomingReshipForFreeCondition.label}
                </EdgeLabel>
            )}
            {incomingRefundShippingCostsCondition && (
                <EdgeLabel isSelected={isSelected} type="refund_shipping_costs">
                    {incomingRefundShippingCostsCondition.label}
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
            {incomingReusableLLMPromptCallCondition && (
                <EdgeLabel
                    onClick={() => {
                        if (
                            incomingReusableLLMPromptCallCondition.isClickable
                        ) {
                            dispatch({
                                type: 'SET_NODE_EDITING_ID',
                                nodeId: incomingReusableLLMPromptCallCondition.nodeId,
                            })
                        }
                    }}
                    isSelected={isSelected}
                    type="reusable_llm_prompt_call"
                >
                    {incomingReusableLLMPromptCallCondition.label}
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
                {menuItems}
            </Dropdown>
        </div>
    )
}
