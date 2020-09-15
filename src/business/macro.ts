import {fromJS, Map, List} from 'immutable'

import {TicketMessageSourceType} from './types/ticket'
import {
    Macro,
    MacroAction,
    MacroClearingResult,
    MacroActionName,
} from './types/macro'

// Public functions
export function clearMacroBeforeApply(
    messageType: TicketMessageSourceType,
    macro: Map<any, any>
): MacroClearingResult {
    let isInvalid =
        messageType === TicketMessageSourceType.FacebookMessenger &&
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
        messageType === TicketMessageSourceType.Chat &&
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
function getAttachmentsCount(macro: Map<any, any>): number {
    return (macro.get('actions', fromJS([])) as List<any>)
        .filter(
            (action: Map<any, any>) =>
                action.get('name') === MacroActionName.AddAttachments
        )
        .reduce(
            (total = 0, action: Map<any, any>) =>
                total +
                (action.getIn(['arguments', 'attachments'], fromJS([])) as List<
                    any
                >).size,
            0
        )
}

function hasText(macro: Map<any, any>): boolean {
    return !(macro.get('actions', fromJS([])) as List<any>)
        .filter(
            (action: Map<any, any>) =>
                action.get('name') === MacroActionName.SetResponseText
        )
        .isEmpty()
}

function removeAttachmentsFromActions(macro: Map<any, any>): Map<any, any> {
    return macro.update('actions', (actions: List<any>) =>
        actions.filter(
            (action: Map<any, any>) =>
                action.get('name') !== MacroActionName.AddAttachments
        )
    )
}
