import { useRef } from 'react'

import { useCopyToClipboard } from '@gorgias/toolkit-react'

import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { CopyButton } from '../CopyButton/CopyButton'
import { IntentsFeedback } from '../IntentsFeedback/IntentsFeedback'
import type { IntentsFeedbackHandle } from '../IntentsFeedback/IntentsFeedback'
import type { BubbleActionItem } from '../MessageBubble/components/BubbleActions'
import { BubbleActions } from '../MessageBubble/components/BubbleActions'
import type { FacebookCommentMeta } from './types'

const PRIVATE_REPLY_WINDOW_DAYS = 7

type FacebookCommentMessageActionsProps = {
    message: TicketMessage
    isHidden: boolean
    onLike: () => void
    onPrivateReply: () => void
    onHideComment: () => void
}

export function FacebookCommentMessageActions({
    message,
    isHidden,
    onLike,
    onPrivateReply,
    onHideComment,
}: FacebookCommentMessageActionsProps) {
    const copyText = message.stripped_text || message.body_text || ''
    const [, copyToClipboard] = useCopyToClipboard()
    const intentsFeedbackRef = useRef<IntentsFeedbackHandle>(null)

    const meta = message.meta as FacebookCommentMeta | null
    const isLiked = Boolean(
        meta?.facebook_reactions?.page_reaction?.reaction_type,
    )

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - PRIVATE_REPLY_WINDOW_DAYS)
    const isMessageTooOld = new Date(message.created_datetime) < sevenDaysAgo
    const isAlreadySent = Boolean(meta?.private_reply?.already_sent)
    const isPrivateReplyDisabled = isMessageTooOld || isAlreadySent
    const privateReplyTooltip = isAlreadySent
        ? 'Only one private reply per comment is allowed'
        : isMessageTooOld
          ? 'Unable to send private reply, comment is over 7 days old'
          : 'Reply by Facebook Messenger'

    const likeTitle = isLiked ? 'Remove like' : 'Like'
    const hideTitle = isHidden ? 'Unhide comment' : 'Hide comment'

    const agentItems: BubbleActionItem[] = [
        {
            id: 'like',
            tooltip: likeTitle,
            compactLabel: likeTitle,
            compactLeadingSlot: 'thumbs-up',
            onAction: onLike,
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

    const customerItems: BubbleActionItem[] = [
        {
            id: 'intents',
            icon: <IntentsFeedback message={message} />,
            compactLabel: 'Intents',
            compactLeadingSlot: 'folder-document',
            onAction: () => intentsFeedbackRef.current?.open(),
            compactAnchor: (
                <IntentsFeedback ref={intentsFeedbackRef} message={message} />
            ),
        },
        {
            id: 'like',
            tooltip: likeTitle,
            compactLabel: likeTitle,
            compactLeadingSlot: 'thumbs-up',
            onAction: onLike,
        },
        {
            id: 'private-reply',
            tooltip: privateReplyTooltip,
            isDisabled: isPrivateReplyDisabled,
            compactLabel: 'Reply by Facebook Messenger',
            compactLeadingSlot: 'channel-fb-messenger',
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
            items={message.from_agent ? agentItems : customerItems}
        />
    )
}
