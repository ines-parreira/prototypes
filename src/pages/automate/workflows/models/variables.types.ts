export type WorkflowVariableType =
    | 'string'
    | 'number'
    | 'date'
    | 'boolean'
    | 'array'
    | 'json'

export type WorkflowVariableFormat = 'currency'

export type WorkflowVariable = {
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
        | 'cancel_subscription'
        | 'skip_charge'
        | 'app'
        | ActionTriggerType
    type: WorkflowVariableType
    format?: WorkflowVariableFormat
    filter?: string
}

export type WorkflowVariableGroup = {
    name: string
    nodeType:
        | 'order_selection'
        | 'http_request'
        | 'shopper_authentication'
        | ActionTriggerType
    variables: WorkflowVariable[]
}

export type ActionTriggerType = 'custom_input'

export type WorkflowVariableList = (WorkflowVariable | WorkflowVariableGroup)[]
