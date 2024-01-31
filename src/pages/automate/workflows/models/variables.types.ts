export type WorkflowVariable = {
    isInvalid?: boolean
    nodeType?: 'text_reply' | 'multiple_choices'
    name: string
    value: string
}
export type WorkflowVariableGroup = {
    name: string
    nodeType: 'order_selection' | 'http_request' | 'shopper_authentication'
    variables: WorkflowVariable[]
}

export type WorkflowVariableList = (WorkflowVariable | WorkflowVariableGroup)[]
