import type { Edge, Node } from '@xyflow/react'

import type { ConditionSchema, ConditionsSchema } from './conditions.types'
import type {
    LanguageCode,
    MessageContent,
    WorkflowTransition,
} from './workflowConfiguration.types'

export interface VisualBuilderErrors {
    [K: string]: string | VisualBuilderErrors
}

export interface VisualBuilderTouched {
    [K: string]: boolean | VisualBuilderTouched
}

export type ChannelTriggerNodeType = Node<
    {
        label: string
        label_tkey: string
        isGreyedOut?: boolean | null
        errors?: {
            label?: string
        } | null
        touched?: {
            label?: boolean
        } | null
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
              }
        )[]
        conditionsType: keyof ConditionsSchema | null
        conditions: ConditionSchema[]
        deactivated_datetime?: string | null
        isGreyedOut?: boolean | null
        errors?: {
            instructions?: string
            inputs?: Record<
                string,
                {
                    name?: string
                    instructions?: string
                }
            >
            conditions?: string | Record<string, string>
        } | null
        touched?: {
            instructions?: boolean
            inputs?: Record<
                string,
                {
                    name?: boolean
                    instructions?: boolean
                }
            >
            conditions?: boolean | Record<string, boolean>
        } | null
    },
    'llm_prompt_trigger'
>

export type ReusableLLMPromptTriggerNodeType = Node<
    {
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
              }
        )[]
        conditionsType: keyof ConditionsSchema | null
        conditions: ConditionSchema[]
        isGreyedOut?: boolean | null
        errors?: {
            inputs?: Record<
                string,
                {
                    name?: string
                    instructions?: string
                }
            >
            conditions?: string | Record<string, string>
        } | null
        touched?: {
            inputs?: Record<
                string,
                {
                    name?: boolean
                    instructions?: boolean
                }
            >
            conditions?: boolean | Record<string, boolean>
        } | null
    },
    'reusable_llm_prompt_trigger'
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
        errors?: {
            content?: string
            choices?: Record<
                string,
                {
                    label?: string
                }
            >
        } | null
        touched?: {
            content?: boolean
            choices?: Record<
                string,
                {
                    label?: boolean
                }
            >
        } | null
    },
    'multiple_choices'
>

export function isMultipleChoicesNodeType(
    node: VisualBuilderNode,
): node is MultipleChoicesNodeType {
    return node.type === 'multiple_choices'
}

export function isConditionsNodeType(
    node: VisualBuilderNode,
): node is ConditionsNodeType {
    return node.type === 'conditions'
}

export function isHttpRequestNodeType(
    node: VisualBuilderNode,
): node is HttpRequestNodeType {
    return node.type === 'http_request'
}

export function isLLMPromptTriggerNodeType(
    node: VisualBuilderNode,
): node is LLMPromptTriggerNodeType {
    return node.type === 'llm_prompt_trigger'
}

export function isReusableLLMPromptTriggerNodeType(
    node: VisualBuilderNode,
): node is ReusableLLMPromptTriggerNodeType {
    return node.type === 'reusable_llm_prompt_trigger'
}

export function isReusableLLMPromptCallNodeType(
    node: VisualBuilderNode,
): node is ReusableLLMPromptCallNodeType {
    return node.type === 'reusable_llm_prompt_call'
}

export type AutomatedMessageNodeType = Node<
    {
        content: MessageContent
        isGreyedOut?: boolean | null
        errors?: {
            content?: string
        } | null
        touched?: {
            content?: boolean
        } | null
    },
    'automated_message'
>

export type TextReplyNodeType = Node<
    {
        content: MessageContent
        isGreyedOut?: boolean | null
        errors?: {
            content?: string
        } | null
        touched?: {
            content?: boolean
        } | null
    },
    'text_reply'
>

export type FileUploadNodeType = Node<
    {
        content: MessageContent
        isGreyedOut?: boolean | null
        errors?: {
            content?: string
        } | null
        touched?: {
            content?: boolean
        } | null
    },
    'file_upload'
>

export type OrderSelectionNodeType = Node<
    {
        content: MessageContent
        isGreyedOut?: boolean | null
        errors?: {
            content?: string
        } | null
        touched?: {
            content?: boolean
        } | null
    },
    'order_selection'
>

export type HttpRequestNodeType = Node<
    {
        name: string
        url: string
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
        headers: { name: string; value: string }[]
        json: string | null
        formUrlencoded: { key: string; value: string }[] | null
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
        testRequestInputs?: Record<string, string>
        testRequestRefreshToken?: string
        outputs?: {
            id: string
            path: string
            description: string
        }[]
        isGreyedOut?: boolean | null
        oauth2TokenSettings?: {
            account_oauth2_token_id: string
            refresh_token_url: string
        } | null
        trackstar_integration_name?: string | null
        serviceConnectionSettings?: {
            integration_id: string | number
            path: string
        } | null
        errors?: {
            name?: string
            url?: string
            headers?: Record<
                string,
                {
                    name?: string
                    value?: string
                }
            >
            json?: string
            formUrlencoded?: Record<
                string,
                {
                    key?: string
                    value?: string
                }
            >
            variables?: Record<
                string,
                {
                    name?: string
                    jsonpath?: string
                }
            >
        } | null
        touched?: {
            name?: boolean
            url?: boolean
            headers?: Record<
                string,
                {
                    name?: boolean
                    value?: boolean
                }
            >
            json?: boolean
            formUrlencoded?: Record<
                string,
                {
                    key?: boolean
                    value?: boolean
                }
            >
            variables?: Record<
                string,
                {
                    name?: boolean
                    jsonpath?: boolean
                }
            >
        } | null
    },
    'http_request'
>

export type LiquidTemplateNodeType = Node<
    {
        name: string
        template: string
        output: {
            data_type: 'string' | 'number' | 'boolean' | 'date'
        }
        isGreyedOut?: boolean | null
        errors?: {
            name?: string
            template?: string
            output?: {
                data_type?: string
            }
        } | null
        touched?: {
            name?: boolean
            template?: boolean
            output?: {
                data_type?: boolean
            }
        } | null
    },
    'liquid_template'
>

export type ShopperAuthenticationNodeType = Node<
    {
        integrationId: number
        isGreyedOut?: boolean | null
        errors?: Record<string, never> | null
        touched?: Record<string, never> | null
    },
    'shopper_authentication'
>

export type EndNodeType = Node<
    {
        action:
            | 'ask-for-feedback'
            | 'create-ticket'
            | 'end'
            | 'end-success'
            | 'end-failure'
        ticketTags?: string[] | null
        ticketAssigneeUserId?: number | null
        ticketAssigneeTeamId?: number | null
        isGreyedOut?: boolean | null
        errors?: Record<string, never> | null
        touched?: Record<string, never> | null
    },
    'end'
>

export type ConditionsNodeType = Node<
    {
        name: string
        isGreyedOut?: boolean | null
        errors?: {
            branches?: Record<
                string,
                {
                    name?: string
                    conditions?: string | Record<string, string>
                }
            >
        } | null
        touched?: {
            branches?: Record<
                string,
                {
                    name?: boolean
                    conditions?: boolean | Record<number, boolean>
                }
            >
        } | null
    },
    'conditions'
>

export type OrderLineItemSelectionNodeType = Node<
    {
        content: MessageContent
        isGreyedOut?: boolean | null
        errors?: {
            content?: string
        } | null
        touched?: {
            content?: boolean
        } | null
    },
    'order_line_item_selection'
>

export type CancelOrderNodeType = Node<
    {
        customerId: string
        orderExternalId: string
        integrationId: string
        restock?: string
        isGreyedOut?: boolean | null
        errors?: Record<string, never> | null
        touched?: Record<string, never> | null
    },
    'cancel_order'
>

export type RefundOrderNodeType = Node<
    {
        customerId: string
        orderExternalId: string
        integrationId: string
        isGreyedOut?: boolean | null
        errors?: Record<string, never> | null
        touched?: Record<string, never> | null
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
        errors?: {
            name?: string
            address1?: string
            address2?: string
            city?: string
            zip?: string
            province?: string
            country?: string
            phone?: string
            lastName?: string
            firstName?: string
        } | null
        touched?: {
            name?: boolean
            address1?: boolean
            address2?: boolean
            city?: boolean
            zip?: boolean
            province?: boolean
            country?: boolean
            phone?: boolean
            lastName?: boolean
            firstName?: boolean
        } | null
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
        errors?: {
            productVariantId?: string
            quantity?: string
        } | null
        touched?: {
            productVariantId?: boolean
            quantity?: boolean
        } | null
    },
    'remove_item'
>

export type ReplaceItemNodeType = Node<
    {
        customerId: string
        orderExternalId: string
        integrationId: string
        productVariantId: string
        quantity: string
        addedProductVariantId: string
        addedQuantity: string
        isGreyedOut?: boolean | null
        errors?: {
            productVariantId?: string
            quantity?: string
            addedProductVariantId?: string
            addedQuantity?: string
        } | null
        touched?: {
            productVariantId?: boolean
            quantity?: boolean
            addedProductVariantId?: boolean
            addedQuantity?: boolean
        } | null
    },
    'replace_item'
>

export type CreateDiscountCodeNodeType = Node<
    {
        integrationId: string
        discountType: string
        amount: string
        validFor: string
        isGreyedOut?: boolean | null
        errors?: Record<string, never> | null
        touched?: Record<string, never> | null
    },
    'create_discount_code'
>

export type ReshipForFreeNodeType = Node<
    {
        customerId: string
        orderExternalId: string
        integrationId: string
        isGreyedOut?: boolean | null
        errors?: Record<string, never> | null
        touched?: Record<string, never> | null
    },
    'reship_for_free'
>

export type EditOrderNoteNodeType = Node<
    {
        customerId: string
        orderExternalId: string
        integrationId: string
        note: string
        isGreyedOut?: boolean | null
        errors?: Record<string, never> | null
        touched?: Record<string, never> | null
    },
    'edit_order_note'
>

export type RefundShippingCostsNodeType = Node<
    {
        customerId: string
        orderExternalId: string
        integrationId: string
        isGreyedOut?: boolean | null
        errors?: Record<string, never> | null
        touched?: Record<string, never> | null
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
        errors?: {
            subscriptionId?: string
            reason?: string
        } | null
        touched?: {
            subscriptionId?: boolean
            reason?: boolean
        } | null
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
        errors?: {
            subscriptionId?: string
            chargeId?: string
        } | null
        touched?: {
            subscriptionId?: boolean
            chargeId?: boolean
        } | null
    },
    'skip_charge'
>

export type ReusableLLMPromptCallNodeType = Node<
    {
        configuration_id: string
        configuration_internal_id: string
        objects?: {
            customer?: string | null
            order?: string | null
            products?: Record<string, string> | null
        } | null
        custom_inputs?: Record<string, string> | null
        values: Record<string, string | number | boolean>
        isGreyedOut?: boolean | null
        errors?: Record<string, never> | null
        touched?: Record<string, never> | null
    },
    'reusable_llm_prompt_call'
>

export type VisualBuilderTriggerNode =
    | ChannelTriggerNodeType
    | LLMPromptTriggerNodeType
    | ReusableLLMPromptTriggerNodeType

export type VisualBuilderNode =
    | VisualBuilderTriggerNode
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
    | ReplaceItemNodeType
    | CreateDiscountCodeNodeType
    | ReshipForFreeNodeType
    | RefundShippingCostsNodeType
    | CancelSubscriptionNodeType
    | SkipChargeNodeType
    | ReusableLLMPromptCallNodeType
    | EditOrderNoteNodeType
    | LiquidTemplateNodeType

export type VisualBuilderEdge = Edge<{
    name?: string | null
    event?: WorkflowTransition['event'] | null
    conditions?: WorkflowTransition['conditions'] | null
}>

export type VisualBuilderGraphShopifyApp = {
    type: 'shopify'
    errors?: Record<string, never> | null
    touched?: Record<string, never> | null
}

export type VisualBuilderGraphRechargeApp = {
    type: 'recharge'
    errors?: Record<string, never> | null
    touched?: Record<string, never> | null
}

export type VisualBuilderGraphAppApp = {
    app_id: string
    api_key?: string | null
    refresh_token?: string | null
    account_oauth2_token_id?: string | null
    type: 'app'
    errors?: {
        api_key?: string
        refresh_token?: string
        trackstar_connection?: string
    } | null
    touched?: {
        api_key?: boolean
        refresh_token?: boolean
        trackstar_connection?: boolean
    } | null
}

export const isVisualBuilderGraphAppApp = (
    app: VisualBuilderGraphApp,
): app is VisualBuilderGraphAppApp => {
    return app.type === 'app'
}

export type VisualBuilderGraphApp =
    | VisualBuilderGraphShopifyApp
    | VisualBuilderGraphRechargeApp
    | VisualBuilderGraphAppApp

export type VisualBuilderGraph<
    T extends VisualBuilderTriggerNode = VisualBuilderTriggerNode,
> = {
    id: string
    internal_id: string
    is_draft: boolean
    name: string
    template_internal_id?: string | null
    advanced_datetime?: Date | null
    category?: string | null
    available_languages: LanguageCode[]
    nodes: [T, ...VisualBuilderNode[]]
    edges: VisualBuilderEdge[]
    apps?: VisualBuilderGraphApp[]
    inputs?:
        | (
              | {
                    id: string
                    name: string
                    description: string
                    data_type: 'string'
                    options?: { value: string; label: string }[] | null
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
                    options?: { value: number; label: string }[] | null
                }
          )[]
        | null
    values?: Record<string, string | number | boolean> | null
    nodeEditingId: VisualBuilderNode['id'] | null
    choiceEventIdEditing:
        | MultipleChoicesNodeType['data']['choices'][number]['event_id']
        | null
    branchIdsEditing: VisualBuilderEdge['id'][]
    isTemplate: boolean
    errors?: {
        name?: string
        nodes?: string
        category?: string
        trackstar_connection_id?: string
    } | null
    touched?: {
        name?: boolean
        nodes?: boolean
        category?: boolean
        trackstar_connection_id?: boolean
    } | null
}
