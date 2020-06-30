// @flow
import {fromJS, type RecordOf} from 'immutable'

import {type Notification} from './notification'
import {type TicketMessageSourceType, TicketMessageSourceTypes} from './ticket'

// Public functions
export function clearMacroBeforeApply(
    messageType: TicketMessageSourceType,
    macro: RecordOf<Macro>
): MacroClearingResult {
    let isInvalid =
        messageType === TicketMessageSourceTypes.FACEBOOK_MESSENGER &&
        hasText(macro) &&
        getAttachmentsCount(macro) > 0

    if (isInvalid) {
        return {
            macro: removeAttachmentsFromActions(macro),
            notification: {
                message:
                    'We have removed the attachment from this message, because you cannot send text and ' +
                    'attachments at the same time on Messenger.',
                status: 'warning',
            },
        }
    }

    isInvalid =
        messageType === TicketMessageSourceTypes.CHAT &&
        getAttachmentsCount(macro) > 1

    if (isInvalid) {
        return {
            macro: removeAttachmentsFromActions(macro),
            notification: {
                message:
                    'We have removed the attachments from this message, because you cannot send multiple ' +
                    'attachments at the same time on Chat.',
                status: 'warning',
            },
        }
    }

    return {macro}
}

// Private functions
function getAttachmentsCount(macro: RecordOf<Macro>): number {
    return macro
        .get('actions', fromJS([]))
        .filter(
            (action: RecordOf<MacroAction>) =>
                action.get('name') === 'addAttachments'
        )
        .reduce(
            (total: number, action: RecordOf<MacroAction>) =>
                total +
                action.getIn(['arguments', 'attachments'], fromJS([])).size,
            0
        )
}

function hasText(macro: RecordOf<Macro>): boolean {
    return !macro
        .get('actions', fromJS([]))
        .filter(
            (action: RecordOf<MacroAction>) =>
                action.get('name') === 'setResponseText'
        )
        .isEmpty()
}

function removeAttachmentsFromActions(macro: RecordOf<Macro>): RecordOf<Macro> {
    return macro.update('actions', (actions) =>
        actions.filter((action) => action.get('name') !== 'addAttachments')
    )
}

// Types
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
