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
        | 'cancel_subscription'
        | 'skip_charge'
        | 'app'
        | 'custom_input'
        | 'merchant_input'
    type: T
    format?: WorkflowVariableFormat
    filter?: string
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
    variables: (WorkflowVariable | WorkflowVariableGroup)[]
}

export type WorkflowVariableList = (WorkflowVariable | WorkflowVariableGroup)[]
