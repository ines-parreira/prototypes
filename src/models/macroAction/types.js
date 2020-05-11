//@flow
import {MACRO_ACTION_NAME, MACRO_ACTION_TYPE} from './constants'

export type MacroAction = {
    arguments: {
        attachments?: MacroActionAttachment[],
        bodyHtml?: string,
        bodyText?: string,
    },
    name: $Values<typeof MACRO_ACTION_NAME>,
    title: string,
    type: $Values<typeof MACRO_ACTION_TYPE>,
}

export type MacroActionAttachment = {
    url: string,
}
