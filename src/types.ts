import type {Map} from 'immutable'

enum ActionTemplateExecution {
    Front = 'front',
    Back = 'back',
}

export type ActionTemplate = {
    execution: ActionTemplateExecution
    name: string
    title: string
    notes?: string[]
    integrationType?: string
    arguments?: Record<string, unknown>
    validators?: Array<{
        validate: (value: {
            integrations: any[]
        }) => Record<string, unknown> | boolean
        error: string
    }>
}

export type Attachment = {
    content_type: string
    name: string
    size: number
    url: string
    type: string
}

export type Schemas = Map<any, any>
