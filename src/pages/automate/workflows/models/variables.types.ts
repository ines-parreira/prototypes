export type WorkflowVariableType =
    | 'string'
    | 'number'
    | 'date'
    | 'boolean'
    | 'array'

export type WorkflowVariable = {
    name: string
    value: string
} & {
    nodeType:
        | 'text_reply'
        | 'multiple_choices'
        | 'file_upload'
        | 'order_selection'
        | 'http_request'
        | 'shopper_authentication'
    type: WorkflowVariableType
    filter?: string
}

export type WorkflowVariableGroup = {
    name: string
    nodeType: 'order_selection' | 'http_request' | 'shopper_authentication'
    variables: WorkflowVariable[]
}

export type WorkflowVariableList = (WorkflowVariable | WorkflowVariableGroup)[]
