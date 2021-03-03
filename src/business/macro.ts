import {fromJS, Map, List} from 'immutable'

import {TicketMessageSourceType} from './types/ticket'
import {MacroClearingResult, MacroActionName} from './types/macro'

// Public functions
export function clearMacroBeforeApply(
    messageType: TicketMessageSourceType,
    macro: Map<any, any>
): MacroClearingResult {
    const isChatAndMoreThanOneAttachment =
        messageType === TicketMessageSourceType.Chat &&
        getAttachmentsCount(macro) > 1
    const isInstagramDMAndTextPlusAttachment =
        messageType === TicketMessageSourceType.InstagramDirectMessage &&
        hasText(macro) &&
        getAttachmentsCount(macro) > 0

    //TODO(@Mehdi) Remove `isInstagramDMAndTextPlusAttachment` when we do https://github.com/gorgias/gorgias/issues/7516
    const isInvalid =
        isChatAndMoreThanOneAttachment || isInstagramDMAndTextPlusAttachment

    if (isInvalid) {
        let notificationMessage =
            'We have removed the attachments from this message'

        if (isChatAndMoreThanOneAttachment) {
            notificationMessage =
                notificationMessage +
                ', because you cannot send multiple attachments at the same time on Chat.'
        }

        if (isInstagramDMAndTextPlusAttachment) {
            notificationMessage =
                notificationMessage +
                ', because you can either send a text message, or an image attachment as an Instagram direct message.'
        }

        return {
            macro: removeAttachmentsFromActions(macro),
            notification: {
                message: notificationMessage,
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

function removeAttachmentsFromActions(macro: Map<any, any>): Map<any, any> {
    return macro.update('actions', (actions: List<any>) =>
        actions.filter(
            (action: Map<any, any>) =>
                action.get('name') !== MacroActionName.AddAttachments
        )
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
