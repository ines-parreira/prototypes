import { useRef } from 'react'

import { useCopyToClipboard } from '@gorgias/toolkit-react'

import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { CopyButton } from '#shared/components/CopyButton/CopyButton'
import { IntentsFeedback } from '#ticket-messages/components/IntentsFeedback/IntentsFeedback'
import type { IntentsFeedbackHandle } from '#ticket-messages/components/IntentsFeedback/IntentsFeedback'
import type { BubbleActionItem } from '#ticket-messages/components/MessageBubble/components/BubbleActions'
import { BubbleActions } from '#ticket-messages/components/MessageBubble/components/BubbleActions'

const PRIVATE_REPLY_WINDOW_DAYS = 7

type PrivateReplyMeta = {
    private_reply?: {
        already_sent?: boolean
    }
}

type InstagramCommentMessageActionsProps = {
    message: TicketMessage
    isHidden: boolean
    onPrivateReply: () => void
    onHideComment: () => void
}

export function InstagramCommentMessageActions({
    message,
    isHidden,
    onPrivateReply,
    onHideComment,
}: InstagramCommentMessageActionsProps) {
    const copyText = message.stripped_text || message.body_text || ''
    const [, copyToClipboard] = useCopyToClipboard()
    const intentsFeedbackRef = useRef<IntentsFeedbackHandle>(null)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - PRIVATE_REPLY_WINDOW_DAYS)
    const isMessageTooOld = new Date(message.created_datetime) < sevenDaysAgo
    const isAlreadySent =
        (message.meta as PrivateReplyMeta | null)?.private_reply
            ?.already_sent === true
    const isPrivateReplyDisabled = isMessageTooOld || isAlreadySent
    const privateReplyTooltip = isAlreadySent
        ? 'Only one private reply per comment is allowed'
        : isMessageTooOld
          ? 'Unable to send private reply, comment is over 7 days old'
          : 'Reply by Instagram DM'

    const hideTitle = isHidden ? 'Unhide comment' : 'Hide comment'

    const intentsItem: BubbleActionItem = {
        id: 'intents',
        icon: <IntentsFeedback message={message} />,
        compactLabel: 'Intents',
        compactLeadingSlot: 'folder-document',
        onAction: () => intentsFeedbackRef.current?.open(),
        compactAnchor: (
            <IntentsFeedback ref={intentsFeedbackRef} message={message} />
        ),
    }

    const items: BubbleActionItem[] = [
        ...(!message.from_agent ? [intentsItem] : []),
        {
            id: 'private-reply',
            tooltip: privateReplyTooltip,
            isDisabled: isPrivateReplyDisabled,
            compactLabel: 'Reply by Instagram DM',
            compactLeadingSlot: 'arrow-undo-down-left',
            onAction: onPrivateReply,
        },
        {
            id: 'hide-comment',
            tooltip: hideTitle,
            compactLabel: hideTitle,
            compactLeadingSlot: isHidden ? 'show' : 'hide',
            onAction: onHideComment,
        },
        {
            id: 'copy',
            icon: <CopyButton text={copyText} />,
            tooltip: 'Copy message',
            compactLabel: 'Copy message',
            compactLeadingSlot: 'copy',
            onAction: () => copyToClipboard(copyText),
        },
    ]

    return (
        <BubbleActions
            placement={message.from_agent ? 'left' : 'right'}
            items={items}
        />
    )
}
