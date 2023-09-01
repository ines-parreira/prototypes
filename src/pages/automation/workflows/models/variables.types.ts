export type FlowVariable = {
    isInvalid?: boolean
    nodeType?: 'text_reply' | 'multiple_choices'
    name: string
    value: string
}
export type FlowVariableGroup = {
    name: string
    nodeType: 'order_selection'
    variables: FlowVariable[]
}

export type FlowVariableList = (FlowVariable | FlowVariableGroup)[]
