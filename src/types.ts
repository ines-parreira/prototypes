import {Map} from 'immutable'

import {MacroActionName} from './models/macroAction/types'

enum ActionTemplateExecution {
    Front = 'front',
    Back = 'back',
}

export type ActionTemplate = {
    execution: ActionTemplateExecution
    name: MacroActionName
    title: string
    notes?: string[]
    integrationType?: string
    arguments?: unknown
    validators?: Array<{
        validate: (value: {integrations: any[]}) => unknown | boolean
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

export type Emoji = {
    colons: string
    emoticons: string[]
    id: string
    name: string
    native: string
    skin: Maybe<string>
    unified: string
}
