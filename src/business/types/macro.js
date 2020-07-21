//@flow
import type {RecordOf} from 'immutable'

import type {Notification} from './notification'

export type MacroActionName = 'addAttachments' | 'setResponseText'

export type MacroActionType = 'user'

export type MacroActionAttachment = {
    url: string,
}

export type MacroActionArguments = {
    // addAttachments
    attachments?: MacroActionAttachment[],
    // setResponseText
    body_html?: string,
    body_text?: string,
}

export type MacroAction = {
    arguments: MacroActionArguments,
    name: MacroActionName,
    title: string,
    type: MacroActionType,
}

export type Macro = {
    id: number,
    name: string,
    actions: MacroAction[],
}

export type MacroClearingResult = {
    macro: RecordOf<Macro>,
    notification?: Notification,
}
