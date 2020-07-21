import type {Map} from 'immutable'

import {MacroActionType} from '../../models/macroAction/types'

import type {Notification} from './notification'

export enum MacroActionName {
    AddAttachments = 'addAttachments',
    SetResponseText = 'setResponseText',
}

export type MacroActionAttachment = {
    url: string
}

export type MacroActionArguments = {
    // addAttachments
    attachments?: MacroActionAttachment[]
    // setResponseText
    body_html?: string
    body_text?: string
}

export type MacroAction = {
    arguments: MacroActionArguments
    name: MacroActionName
    title: string
    type: MacroActionType
}

export type Macro = {
    id: number
    name: string
    actions: MacroAction[]
}

export type MacroClearingResult = {
    macro: Map<any, any>
    notification?: Notification
}
