import {Edge, Node} from 'reactflow'

import {ConditionSchema, ConditionsSchema} from './conditions.types'
import {
    LanguageCode,
    MessageContent,
    WorkflowConfiguration,
    WorkflowTransition,
} from './workflowConfiguration.types'

export type ChannelTriggerNodeType = Node<
    {
        label: string
        label_tkey: string
        isGreyedOut?: boolean | null
    },
    'channel_trigger'
>

export type LLMPromptTriggerNodeType = Node<
    {
        instructions: string
        requires_confirmation: boolean
        inputs: (
            | {
                  id: string
                  name: string
                  instructions: string
                  data_type: 'string' | 'number' | 'date' | 'boolean'
              }
            | {
                  id: string
                  name: string
                  instructions: string
                  kind: 'product'
                  integration_id: number | string
              }
        )[]
        conditionsType: keyof ConditionsSchema | null
        conditions: ConditionSchema[]
        deactivated_datetime?: string | null
        isGreyedOut?: boolean | null
    },
    'llm_prompt_trigger'
>

export type MultipleChoicesNodeType = Node<
    {
        content: MessageContent
        choices: {
            event_id: string
            label: string
            label_tkey?: string
        }[]
        isGreyedOut?: boolean | null
    },
    'multiple_choices'
>

export function isMultipleChoicesNodeType(
    node: VisualBuilderNode
): node is MultipleChoicesNodeType {
    return node.type === 'multiple_choices'
}

export function isConditionsNodeType(
    node: VisualBuilderNode
): node is ConditionsNodeType {
    return node.type === 'conditions'
}

export function isHttpRequestNodeType(
    node: VisualBuilderNode
): node is HttpRequestNodeType {
    return node.type === 'http_request'
}

export function isLLMPromptTriggerNodeType(
    node: VisualBuilderNode
): node is LLMPromptTriggerNodeType {
    return node.type === 'llm_prompt_trigger'
}

export function isTriggerNodeType(
    node: VisualBuilderNode
): node is ChannelTriggerNodeType | LLMPromptTriggerNodeType {
    return node.type === 'channel_trigger' || isLLMPromptTriggerNodeType(node)
}

export type AutomatedMessageNodeType = Node<
    {
        content: MessageContent
        isGreyedOut?: boolean | null
    },
    'automated_message'
>

export type TextReplyNodeType = Node<
    {
        content: MessageContent
        isGreyedOut?: boolean | null
    },
    'text_reply'
>

export type FileUploadNodeType = Node<
    {
        content: MessageContent
        isGreyedOut?: boolean | null
    },
    'file_upload'
>

export type OrderSelectionNodeType = Node<
    {
        content: MessageContent
        isGreyedOut?: boolean | null
    },
    'order_selection'
>

export type HttpRequestNodeType = Node<
    {
        name: string
        url: string
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
        headers: {name: string; value: string}[]
        json: string | null
        formUrlencoded: {key: string; value: string}[] | null
        bodyContentType:
            | 'application/json'
            | 'application/x-www-form-urlencoded'
            | null
        variables: {
            id: string
            name: string
            jsonpath: string
            data_type: 'number' | 'string' | 'boolean' | 'date' | 'json'
        }[]
        testRequestResult?: {
            status: number
            content?: string
        }
        outputs?: {
            id: string
            path: string
            description: string
        }[]
        isGreyedOut?: boolean | null
    },
    'http_request'
>

export type ShopperAuthenticationNodeType = Node<
    {
        integrationId: number
        isGreyedOut?: boolean | null
    },
    'shopper_authentication'
>

export type EndNodeType = Node<
    {
        action: 'ask-for-feedback' | 'create-ticket' | 'end'
        ticketTags?: string[] | null
        ticketAssigneeUserId?: number | null
        ticketAssigneeTeamId?: number | null
        isGreyedOut?: boolean | null
    },
    'end'
>

export type ConditionsNodeType = Node<
    {
        name: string
        isGreyedOut?: boolean | null
    },
    'conditions'
>

export type OrderLineItemSelectionNodeType = Node<
    {
        content: MessageContent
        isGreyedOut?: boolean | null
    },
    'order_line_item_selection'
>

export type CancelOrderNodeType = Node<
    {
        customerId: string
        orderExternalId: string
        integrationId: string
        isGreyedOut?: boolean | null
    },
    'cancel_order'
>

export type RefundOrderNodeType = Node<
    {
        customerId: string
        orderExternalId: string
        integrationId: string
        isGreyedOut?: boolean | null
    },
    'refund_order'
>

export type UpdateShippingAddressNodeType = Node<
    {
        customerId: string
        orderExternalId: string
        integrationId: string
        name: string
        address1: string
        address2: string
        city: string
        zip: string
        province: string
        country: string
        phone: string
        lastName: string
        firstName: string
        isGreyedOut?: boolean | null
    },
    'update_shipping_address'
>
export type RemoveItemNodeType = Node<
    {
        customerId: string
        orderExternalId: string
        integrationId: string
        productVariantId: string
        quantity: string
        isGreyedOut?: boolean | null
    },
    'remove_item'
>

export type CreateDiscountCodeNodeType = Node<
    {
        customerId: string
        integrationId: string
        discountType: string
        amount: string
        validFor: string
        isGreyedOut?: boolean | null
    },
    'create_discount_code'
>

export type ReshipForFreeNodeType = Node<
    {
        customerId: string
        orderExternalId: string
        integrationId: string
        isGreyedOut?: boolean | null
    },
    'reship_for_free'
>

export type RefundShippingCostsNodeType = Node<
    {
        customerId: string
        orderExternalId: string
        integrationId: string
        isGreyedOut?: boolean | null
    },
    'refund_shipping_costs'
>

export type CancelSubscriptionNodeType = Node<
    {
        customerId: string
        integrationId: string
        subscriptionId: string
        reason: string
        isGreyedOut?: boolean | null
    },
    'cancel_subscription'
>

export type SkipChargeNodeType = Node<
    {
        customerId: string
        integrationId: string
        subscriptionId: string
        chargeId: string
        isGreyedOut?: boolean | null
    },
    'skip_charge'
>

export type VisualBuilderNode =
    | ChannelTriggerNodeType
    | LLMPromptTriggerNodeType
    | MultipleChoicesNodeType
    | AutomatedMessageNodeType
    | TextReplyNodeType
    | FileUploadNodeType
    | OrderSelectionNodeType
    | HttpRequestNodeType
    | EndNodeType
    | ShopperAuthenticationNodeType
    | ConditionsNodeType
    | OrderLineItemSelectionNodeType
    | CancelOrderNodeType
    | RefundOrderNodeType
    | UpdateShippingAddressNodeType
    | RemoveItemNodeType
    | CreateDiscountCodeNodeType
    | ReshipForFreeNodeType
    | RefundShippingCostsNodeType
    | CancelSubscriptionNodeType
    | SkipChargeNodeType

export type VisualBuilderEdge = Edge<{
    name?: string | null
    event?: WorkflowTransition['event'] | null
    conditions?: WorkflowTransition['conditions'] | null
}>

export type VisualBuilderGraph = {
    name: string
    available_languages: LanguageCode[]
    nodes: VisualBuilderNode[]
    edges: VisualBuilderEdge[]
    apps?: (
        | {
              type: 'shopify'
          }
        | {
              type: 'recharge'
          }
        | {
              app_id: string
              api_key?: string | null
              type: 'app'
          }
    )[]
    inputs?:
        | (
              | {
                    id: string
                    name: string
                    description: string
                    data_type: 'string'
                    options?: {value: string; label: string}[] | null
                }
              | {
                    id: string
                    name: string
                    description: string
                    data_type: 'boolean'
                }
              | {
                    id: string
                    name: string
                    description: string
                    data_type: 'date'
                }
              | {
                    id: string
                    name: string
                    description: string
                    data_type: 'number'
                    options?: {value: number; label: string}[] | null
                }
          )[]
        | null
    values?: Record<string, string | number | boolean> | null
    wfConfigurationOriginal: WorkflowConfiguration
    nodeEditingId: VisualBuilderNode['id'] | null
    choiceEventIdEditing:
        | MultipleChoicesNodeType['data']['choices'][number]['event_id']
        | null
    branchIdsEditing: VisualBuilderEdge['id'][]
}
