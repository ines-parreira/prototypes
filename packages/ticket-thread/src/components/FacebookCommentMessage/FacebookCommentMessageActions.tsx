import type { ReactNode } from 'react'

import {
    ButtonGroup,
    ButtonGroupItem,
    Icon,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'
import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { CopyButton } from '../CopyButton/CopyButton'
import { IntentsFeedback } from '../IntentsFeedback/IntentsFeedback'
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

type ActionItemProps = {
    id: string
    tooltip: string
    icon: ReactNode
    isDisabled?: boolean
}

function ActionItem({ id, tooltip, icon, isDisabled }: ActionItemProps) {
    return (
        <Tooltip
            trigger={
                <ButtonGroupItem id={id} icon={icon} isDisabled={isDisabled} />
            }
        >
            <TooltipContent title={tooltip} />
        </Tooltip>
    )
}

export function FacebookCommentMessageActions({
    message,
    isHidden,
    onLike,
    onPrivateReply,
    onHideComment,
}: FacebookCommentMessageActionsProps) {
    const copyText = message.stripped_text || message.body_text || ''
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

    function handleSelectionChange(key: string) {
        if (key === 'like') {
            onLike()
        } else if (key === 'private-reply') {
            onPrivateReply()
        } else if (key === 'hide-comment') {
            onHideComment()
        }
    }

    const likeTitle = isLiked ? 'Remove like' : 'Like'
    const hideTitle = isHidden ? 'Unhide comment' : 'Hide comment'

    if (message.from_agent) {
        return (
            <BubbleActions placement="left">
                <ButtonGroup
                    selectedKey=""
                    onSelectionChange={handleSelectionChange}
                >
                    <ActionItem
                        id="like"
                        tooltip={likeTitle}
                        icon={
                            <Icon name="thumbs-up" size="sm" alt={likeTitle} />
                        }
                    />
                    <ActionItem
                        id="copy"
                        tooltip="Copy message"
                        icon={<CopyButton text={copyText} />}
                    />
                </ButtonGroup>
            </BubbleActions>
        )
    }

    return (
        <BubbleActions placement="right">
            <ButtonGroup
                selectedKey=""
                onSelectionChange={handleSelectionChange}
            >
                <ActionItem
                    id="intents"
                    tooltip="Message intent"
                    icon={<IntentsFeedback message={message} />}
                />
                <ActionItem
                    id="like"
                    tooltip={likeTitle}
                    icon={<Icon name="thumbs-up" size="sm" alt={likeTitle} />}
                />
                <ActionItem
                    id="private-reply"
                    tooltip={privateReplyTooltip}
                    isDisabled={isPrivateReplyDisabled}
                    icon={
                        <Icon
                            name="channel-fb-messenger"
                            size="sm"
                            alt="Private reply"
                        />
                    }
                />
                <ActionItem
                    id="hide-comment"
                    tooltip={hideTitle}
                    icon={
                        <Icon
                            name={(isHidden ? 'show' : 'hide') as IconName}
                            size="sm"
                            alt={hideTitle}
                        />
                    }
                />
                <ActionItem
                    id="copy"
                    tooltip="Copy message"
                    icon={<CopyButton text={copyText} />}
                />
            </ButtonGroup>
        </BubbleActions>
    )
}
