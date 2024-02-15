export type WorkflowVariable = {
    isInvalid?: boolean
    name: string
    value: string
} & (
    | {
          nodeType:
              | 'text_reply'
              | 'multiple_choices'
              | 'file_upload'
              | 'order_selection'
              | 'http_request'
              | 'shopper_authentication'
      }
    | {
          nodeType?: never
      }
)

export type WorkflowVariableGroup = {
    name: string
    nodeType: 'order_selection' | 'http_request' | 'shopper_authentication'
    variables: WorkflowVariable[]
}

export type WorkflowVariableList = (WorkflowVariable | WorkflowVariableGroup)[]
