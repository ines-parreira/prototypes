// @flow
import { fromJS, Map } from 'immutable'

import { INotification } from './notification'
import { type TicketMessageSourceType, TicketMessageSourceTypes } from './ticket'

// Public functions
export function clearMacroBeforeApply(
    messageType: TicketMessageSourceType,
    macro: Macro,
): IMacroClearingResult {
    let isInvalid = messageType === TicketMessageSourceTypes.FACEBOOK_MESSENGER
        && hasText(macro)
        && getAttachmentsCount(macro) > 0

    if (isInvalid) {
        return {
            macro: removeAttachmentsFromActions(macro),
            notification: {
                message: 'We have removed the attachment from this message, because you cannot send text and attachments at the same time on Messenger.',
                status: 'warning'
            },
        }
    }

    isInvalid = messageType === TicketMessageSourceTypes.CHAT
        && getAttachmentsCount(macro) > 1

    if (isInvalid) {
        return {
            macro: removeAttachmentsFromActions(macro),
            notification: {
                message: 'We have removed the attachments from this message, because you cannot send multiple attachments at the same time on Chat.',
                status: 'warning'
            },
        }
    }

    return { macro }
}

// Private functions
function getAttachmentsCount(macro: Macro): number {
    return macro.get('actions', fromJS([]))
        .filter((action: MacroAction) => action.get('name') === 'addAttachments')
        .reduce(
            (total: number, action: MacroAction) =>
                total + action.getIn(['arguments', 'attachments'], fromJS([])).size,
            0
        )
}

function hasText(macro: Macro): boolean {
    return !macro.get('actions', fromJS([]))
        .filter((action: MacroAction) => action.get('name') === 'setResponseText')
        .isEmpty()
}

function removeAttachmentsFromActions(macro: Macro): Macro {
    return macro.update(
        'actions',
        (actions) => actions.filter((action) => action.get('name') !== 'addAttachments')
    )
}

// Types
export type Macro = Map<string, Map<string, IMacro>>
export type MacroAction = Map<string, IMacroAction>

export type MacroActionName = 'addAttachments' | 'setResponseText'

export type MacroActionType = 'user'

export interface IMacro {
    id: number;
    name: string;
    actions: IMacroAction[];
}

export interface IMacroAction {
    arguments: IMacroActionArguments;
    name: MacroActionName;
    title: string;
    type: MacroActionType;
}

// Using optional properties with interfaces is not stable...
// https://github.com/facebook/flow/issues/5851
export type IMacroActionArguments = {
    // addAttachments
    attachments?: IMacroActionAttachment[];
    // setResponseText
    body_html?: string;
    body_text?: string;
}

export interface IMacroActionAttachment {
    url: string
}

export interface IMacroClearingResult {
    macro: Macro;
    notification?: INotification;
}
