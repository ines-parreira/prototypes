import type { Macro } from '@gorgias/helpdesk-queries'

import { MacroActionName } from 'models/macroAction/types'
import { NotificationStatus } from 'state/notifications/types'

import type { Notification } from './types/notification'
import { TicketMessageSourceType } from './types/ticket'

export type MacroClearingResult = {
    macro: Macro
    notification?: Notification
}

// Public functions
export function clearMacroBeforeApply(
    messageType: TicketMessageSourceType,
    macro: Macro,
): MacroClearingResult {
    const isChatAndMoreThanOneAttachment =
        messageType === TicketMessageSourceType.Chat &&
        getAttachmentsCount(macro) > 1

    const isInstagramDMAndTextPlusAttachment =
        messageType === TicketMessageSourceType.InstagramDirectMessage &&
        hasText(macro) &&
        getAttachmentsCount(macro) > 0

    const isTwitterDMAndMoreThanOneAttachment =
        messageType === TicketMessageSourceType.TwitterDirectMessage &&
        getAttachmentsCount(macro) > 1

    //TODO(@Mehdi) Remove `isInstagramDMAndTextPlusAttachment` when we do https://github.com/gorgias/gorgias/issues/7516
    const isInvalid =
        isChatAndMoreThanOneAttachment ||
        isInstagramDMAndTextPlusAttachment ||
        isTwitterDMAndMoreThanOneAttachment

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

        if (isTwitterDMAndMoreThanOneAttachment) {
            notificationMessage =
                notificationMessage +
                ', because you cannot send multiple attachments at the same time on Twitter direct message.'
        }

        return {
            macro: removeAttachmentsFromActions(macro),
            notification: {
                message: notificationMessage,
                status: NotificationStatus.Warning,
            },
        }
    }

    return { macro }
}

// Private functions
function getAttachmentsCount(macro: Macro): number {
    return (
        macro.actions
            ?.filter((action) => action.name === MacroActionName.AddAttachments)
            .reduce(
                (total = 0, action) =>
                    total +
                    (action.arguments as { attachments: string }).attachments
                        .length,
                0,
            ) ?? 0
    )
}

function removeAttachmentsFromActions(macro: Macro) {
    return {
        ...macro,
        actions: macro.actions?.filter(
            (action) => action.name !== MacroActionName.AddAttachments,
        ),
    }
}

function hasText(macro: Macro): boolean {
    return !!macro.actions?.filter(
        (action) => action.name === MacroActionName.SetResponseText,
    ).length
}
