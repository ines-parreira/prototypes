import type { ProductCardAttachment } from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'

import type { ConditionsSchema } from './conditions.types'

export type MessageContent = {
    html: string
    html_tkey?: string
    text: string
    text_tkey?: string
    attachments?: ProductCardAttachment[] | null
}

type Message = {
    content: MessageContent
}

export type WorkflowStepMessage = {
    id: string
    kind: 'message'
    settings: {
        message: Message
    }
}

export type WorkflowStepTextInput = {
    id: string
    kind: 'text-input'
    settings: {
        message: Message
    }
}

export type WorkflowStepAttachmentsInput = {
    id: string
    kind: 'attachments-input'
    settings: {
        message: Message
    }
}

export type WorkflowStepChoices = {
    id: string
    kind: 'choices'
    settings: {
        choices: {
            event_id: string
            label: string
            label_tkey?: string
        }[]
        message: Message
    }
}

export type WorkflowStepHandover = {
    id: string
    kind: 'handover'
    settings: {
        ticket_tags?: string[] | null
        ticket_assignee_user_id?: number | null
        ticket_assignee_team_id?: number | null
    }
}

export type WorkflowStepShopperAuthentication = {
    id: string
    kind: 'shopper-authentication'
    settings: {
        integration_id: number
    }
}

export type WorkflowStepConditions = {
    id: string
    kind: 'conditions'
    settings: {
        name: string
    }
}

export type WorkflowStepOrderSelection = {
    id: string
    kind: 'order-selection'
    settings: {
        message: Message
    }
}

export type WorkflowStepHelpfulPrompt = {
    id: string
    kind: 'helpful-prompt'
    settings?: {
        ticket_tags?: string[] | null
        ticket_assignee_user_id?: number | null
        ticket_assignee_team_id?: number | null
    }
}

export type WorkflowStepHttpRequest = {
    id: string
    kind: 'http-request'
    settings: {
        name: string
        url: string
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
        headers?: Record<string, string> | null
        body?: string | null
        oauth2_token_settings?: {
            account_oauth2_token_id: string
            refresh_token_url: string
        } | null
        trackstar_integration_name?: string | null
        service_connection_settings?: {
            integration_id: string
            path: string
        } | null
        variables: {
            id: string
            name: string
            jsonpath: string
            data_type?: 'string' | 'number' | 'boolean' | 'date' | null
        }[]
    }
}

export type WorkflowStepLiquidTemplate = {
    id: string
    kind: 'liquid-template'
    settings: {
        name: string
        template: string
        output: {
            data_type: 'string' | 'number' | 'boolean' | 'date'
        }
    }
}

export type WorkflowStepEnd = {
    id: string
    kind: 'end'
    settings?: {
        success: boolean
    } | null
}

export type WorkflowStepOrderLineItemSelection = {
    id: string
    kind: 'order-line-item-selection'
    settings: {
        message: Message
    }
}

export type WorkflowStepCancelOrder = {
    id: string
    kind: 'cancel-order'
    settings: {
        customer_id: string
        order_external_id: string
        integration_id: string
        restock?: string
    }
}

export type WorkflowStepReusableLlmPromptCall = {
    id: string
    kind: 'reusable-llm-prompt-call'
    settings: {
        configuration_id: string
        configuration_internal_id: string
        objects?: {
            customer?: string | null
            order?: string | null
            products?: {
                [name: string]: string
            } | null
        } | null
        custom_inputs?: {
            [name: string]: string
        } | null
        values: {
            [name: string]: string | number | boolean
        }
    }
}

export type WorkflowStepRefundOrder = {
    id: string
    kind: 'refund-order'
    settings: {
        customer_id: string
        order_external_id: string
        integration_id: string
    }
}

export type WorkflowStepUpdateShippingAddress = {
    id: string
    kind: 'update-shipping-address'
    settings: {
        customer_id: string
        order_external_id: string
        integration_id: string
        name: string
        address1: string
        address2: string
        city: string
        zip: string
        province: string
        country: string
        phone: string
        last_name: string
        first_name: string
    }
}

export type WorkflowStepRemoveItem = {
    id: string
    kind: 'remove-item'
    settings: {
        customer_id: string
        order_external_id: string
        integration_id: string
        product_variant_id: string
        quantity: string
    }
}

export type WorkflowStepReplaceItem = {
    id: string
    kind: 'replace-item'
    settings: {
        customer_id: string
        order_external_id: string
        integration_id: string
        product_variant_id: string
        quantity: string
        added_product_variant_id: string
        added_quantity: string
    }
}

export type WorkflowStepCreateDiscountCode = {
    id: string
    kind: 'create-discount-code'
    settings: {
        integration_id: string
        type: string // e.g. {{values.type}}
        amount: string
        valid_for: string
    }
}

export type WorkflowStepReshipForFree = {
    id: string
    kind: 'reship-for-free'
    settings: {
        customer_id: string
        order_external_id: string
        integration_id: string
    }
}

export type WorkflowStepRefundShippingCosts = {
    id: string
    kind: 'refund-shipping-costs'
    settings: {
        customer_id: string
        order_external_id: string
        integration_id: string
    }
}

export type WorkflowStepCancelSubscription = {
    id: string
    kind: 'cancel-subscription'
    settings: {
        customer_id: string
        integration_id: string
        subscription_id: string
        reason: string
    }
}

export type WorkflowStepSkipCharge = {
    id: string
    kind: 'skip-charge'
    settings: {
        customer_id: string
        integration_id: string
        subscription_id: string
        charge_id: string
    }
}

export type WorkflowStepReusableLLMPromptCall = {
    id: string
    kind: 'reusable-llm-prompt-call'
    settings: {
        configuration_id: string
        configuration_internal_id: string
        objects?: {
            customer?: string | null
            order?: string | null
            products?: Record<string, string> | null
        } | null
        custom_inputs?: Record<string, string> | null
        values: Record<string, string | number | boolean>
    }
}

export type WorkflowStepEditOrderNote = {
    id: string
    kind: 'edit-order-note'
    settings: {
        customer_id: string
        order_external_id: string
        integration_id: string
        note: string
    }
}

export type WorkflowStep =
    | WorkflowStepTextInput
    | WorkflowStepAttachmentsInput
    | WorkflowStepChoices
    | WorkflowStepHandover
    | WorkflowStepShopperAuthentication
    | WorkflowStepHttpRequest
    | WorkflowStepMessage
    | WorkflowStepOrderSelection
    | WorkflowStepHelpfulPrompt
    | WorkflowStepEnd
    | WorkflowStepConditions
    | WorkflowStepOrderLineItemSelection
    | WorkflowStepCancelOrder
    | WorkflowStepRefundOrder
    | WorkflowStepUpdateShippingAddress
    | WorkflowStepRemoveItem
    | WorkflowStepReplaceItem
    | WorkflowStepCreateDiscountCode
    | WorkflowStepReshipForFree
    | WorkflowStepRefundShippingCosts
    | WorkflowStepCancelSubscription
    | WorkflowStepSkipCharge
    | WorkflowStepReusableLLMPromptCall
    | WorkflowStepEditOrderNote
    | WorkflowStepLiquidTemplate

export type WorkflowTransition = {
    id: string
    from_step_id: string
    to_step_id: string
    event?: Maybe<{
        id: string
        kind: 'choices'
    }>
    name?: string | null
    conditions?: ConditionsSchema | null
}

export const supportedLanguages = [
    { code: 'en-US', label: 'English - US' } as const,
    { code: 'en-GB', label: 'English - GB' } as const,
    { code: 'fr-FR', label: 'French - FR' } as const,
    { code: 'de-DE', label: 'German' } as const,
    { code: 'es-ES', label: 'Spanish' } as const,
    { code: 'cs-CZ', label: 'Czech' } as const,
    { code: 'da-DK', label: 'Danish' } as const,
    { code: 'nl-NL', label: 'Dutch' } as const,
    { code: 'fi-FI', label: 'Finnish' } as const,
    { code: 'fr-CA', label: 'French - CA' } as const,
    { code: 'it-IT', label: 'Italian' } as const,
    { code: 'ja-JP', label: 'Japanese' } as const,
    { code: 'no-NO', label: 'Norwegian' } as const,
    { code: 'pt-BR', label: 'Portuguese - BR' } as const,
    { code: 'sv-SE', label: 'Swedish' } as const,
] as const
export type LanguageCode = (typeof supportedLanguages)[number]['code']

export type LlmPromptTrigger = {
    kind: 'llm-prompt'
    settings: {
        custom_inputs: {
            id: string
            name: string
            instructions: string
            data_type: 'string' | 'number' | 'date' | 'boolean'
        }[]
        object_inputs: (
            | {
                  kind: 'customer'
                  integration_id: number | string
              }
            | {
                  kind: 'order'
                  integration_id: number | string
              }
            | {
                  kind: 'order-shipmonk'
                  integration_id: number | string
              }
            | {
                  kind: 'product'
                  integration_id: number | string
                  name: string
                  instructions: string
                  id: string
              }
            | { kind: 'order-shipmonk'; integration_id: number }
            | { kind: 'order-3pl'; integration_id: number }
        )[]
        conditions?: ConditionsSchema | null
        outputs: {
            id: string
            description: string
            path: string
        }[]
    }
}

export type ReusableLLMPromptTrigger = {
    kind: 'reusable-llm-prompt'
    settings: {
        custom_inputs: {
            id: string
            name: string
            instructions: string
            data_type: 'string' | 'number' | 'date' | 'boolean'
        }[]
        object_inputs: (
            | {
                  kind: 'customer'
              }
            | {
                  kind: 'order'
              }
            | {
                  kind: 'product'
                  name: string
                  instructions: string
                  id: string
              }
            | {
                  kind: 'order_shipmonk'
                  integration_id: number
              }
            | {
                  kind: 'order-3pl'
                  integration_id: number
              }
        )[]
        outputs: {
            id: string
            name: string
            description: string
            path: string
            data_type?: 'string' | 'number' | 'date' | 'boolean' | null
        }[]
    }
}

export type WorkflowConfiguration = {
    id: string
    internal_id: string
    is_draft: boolean
    name: string
    initial_step_id: string | null
    updated_datetime?: string
    advanced_datetime?: string | null
    entrypoint?: {
        label: string
        label_tkey: string
    } | null
    triggers?: (
        | LlmPromptTrigger
        | ReusableLLMPromptTrigger
        | {
              kind: 'channel'
              settings: Record<string, unknown>
          }
    )[]
    entrypoints?: (
        | {
              deactivated_datetime?: string | null
              kind: 'llm-conversation'
              trigger: 'llm-prompt'
              settings: {
                  requires_confirmation: boolean
                  instructions: string
              }
          }
        | {
              deactivated_datetime?: string | null
              kind: 'reusable-llm-prompt-call-step'
              trigger: 'reusable-llm-prompt'
              settings: {
                  requires_confirmation: boolean
                  conditions?: ConditionsSchema | null
              }
          }
    )[]
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
              refresh_token?: string | null
              account_oauth2_token_id?: string | null
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
                    options?: { value: string; label: string }[] | null
                }
              | {
                    id: string
                    name: string
                    description: string
                    data_type: 'number'
                    options?: { value: number; label: string }[] | null
                }
              | {
                    id: string
                    name: string
                    description: string
                    data_type: 'boolean' | 'date'
                }
          )[]
        | null
    values?: Record<string, string | number | boolean> | null
    steps: WorkflowStep[]
    transitions: WorkflowTransition[]
    available_languages: LanguageCode[]
    template_internal_id?: string | null
    category?: string | null
}

export type WorkflowConfigurationShallow = Omit<
    WorkflowConfiguration,
    'steps' | 'transitions'
> & {
    steps: Array<{
        kind: WorkflowStep['kind']
    }>
    created_datetime: string
    updated_datetime: string
    deleted_datetime: string | null
}

export enum WorkflowTemplateLabelType {
    ProductQuestion = 'Product Question',
    Policies = 'Policies',
    SubscriptionManagement = 'Subscription Management',
    ThirdPartyActions = '3rd Party Actions',
    PaymentAndDiscounts = 'Payment & Discounts',
}

export type WorkflowTemplate = {
    slug: string
    name: string
    description: string
    label: WorkflowTemplateLabelType
    getConfiguration: (
        id: string,
        integrationId: number,
    ) => WorkflowConfiguration
}

export enum WorkflowToggle {
    Editor = 'editor',
    Analytics = 'analytics',
}
