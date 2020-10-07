//@flow
import {MACRO_ACTION_NAME, MACRO_ACTION_TYPE} from './constants'

export type MacroActionName = $Values<typeof MACRO_ACTION_NAME>

export type MacroActionType = $Values<typeof MACRO_ACTION_TYPE>

export type MacroAction = {
    arguments: {
        attachments?: MacroActionAttachment[],
        body_html?: string,
        body_text?: string,
    },
    name: MacroActionName,
    title: string,
    type: MacroActionType,
}

export type MacroActionAttachment = {
    url: string,
}
