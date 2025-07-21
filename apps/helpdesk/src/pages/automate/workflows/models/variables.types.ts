import { ReactNode } from 'react'

export type WorkflowVariableType =
    | 'string'
    | 'number'
    | 'date'
    | 'boolean'
    | 'array'
    | 'json'

export type WorkflowVariableFormat = 'currency'

type BaseWorkflowVariable<T extends WorkflowVariableType> = {
    name: string
    value: string
    nodeType:
        | 'text_reply'
        | 'multiple_choices'
        | 'file_upload'
        | 'order_selection'
        | 'http_request'
        | 'shopper_authentication'
        | 'cancel_order'
        | 'refund_order'
        | 'update_shipping_address'
        | 'remove_item'
        | 'replace_item'
        | 'create_discount_code'
        | 'reship_for_free'
        | 'refund_shipping_costs'
        | 'edit_order_note'
        | 'cancel_subscription'
        | 'skip_charge'
        | 'app'
        | 'custom_input'
        | 'reusable_llm_prompt_call'
        | 'merchant_input'
        | 'order_shipmonk'
    type: T
    format?: WorkflowVariableFormat
    filter?: string
    icon?: ReactNode
}

type StringWorkflowVariable = BaseWorkflowVariable<'string'> & {
    options?: {
        value: string | null
        label: string
    }[]
}

type NumberWorkflowVariable = BaseWorkflowVariable<'number'>
type DateWorkflowVariable = BaseWorkflowVariable<'date'>
type BooleanWorkflowVariable = BaseWorkflowVariable<'boolean'>
type ArrayWorkflowVariable = BaseWorkflowVariable<'array'>
type JSONWorkflowVariable = BaseWorkflowVariable<'json'>

export type WorkflowVariable =
    | StringWorkflowVariable
    | NumberWorkflowVariable
    | DateWorkflowVariable
    | BooleanWorkflowVariable
    | ArrayWorkflowVariable
    | JSONWorkflowVariable

export type WorkflowVariableGroup = {
    name: string
    nodeType:
        | 'order_selection'
        | 'http_request'
        | 'shopper_authentication'
        | 'custom_input'
        | 'merchant_input'
        | 'order_shipmonk'
        | 'reusable_llm_prompt_call'
    variables: (WorkflowVariable | WorkflowVariableGroup)[]
    icon?: ReactNode
}

export type WorkflowVariableList = (WorkflowVariable | WorkflowVariableGroup)[]

export const SHIPMONK_APPLICATION_ID = '6227229308665b40d624fd4c' as const
export const AVAILABLE_3PL_INTEGRATIONS = [SHIPMONK_APPLICATION_ID] as const

export type AvailableIntegrations = {
    application_id: (typeof AVAILABLE_3PL_INTEGRATIONS)[number]
    integration_id: number
}[]
