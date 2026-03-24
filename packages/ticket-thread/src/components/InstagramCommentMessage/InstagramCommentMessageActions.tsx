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

const PRIVATE_REPLY_WINDOW_DAYS = 7

type PrivateReplyMeta = {
    private_reply?: {
        already_sent?: boolean
    }
}

type InstagramCommentMessageActionsProps = {
    message: TicketMessage
    copyText: string
    isHidden: boolean
    onPrivateReply: () => void
    onHideComment: () => void
}

export function InstagramCommentMessageActions({
    message,
    copyText,
    isHidden,
    onPrivateReply,
    onHideComment,
}: InstagramCommentMessageActionsProps) {
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

    function handleSelectionChange(key: string) {
        if (key === 'private-reply') {
            onPrivateReply()
        } else if (key === 'hide-comment') {
            onHideComment()
        }
    }

    return (
        <ButtonGroup selectedKey="" onSelectionChange={handleSelectionChange}>
            {!message.from_agent && (
                <Tooltip
                    trigger={
                        <ButtonGroupItem
                            id="intents"
                            icon={<IntentsFeedback message={message} />}
                        />
                    }
                >
                    <TooltipContent title="Message intent" />
                </Tooltip>
            )}
            <Tooltip
                trigger={
                    <ButtonGroupItem
                        id="private-reply"
                        isDisabled={isPrivateReplyDisabled}
                        icon={
                            <Icon
                                name={'arrow-undo-down-left' as IconName}
                                size="sm"
                                alt="Private reply"
                            />
                        }
                    />
                }
            >
                <TooltipContent title={privateReplyTooltip} />
            </Tooltip>
            <Tooltip
                trigger={
                    <ButtonGroupItem
                        id="hide-comment"
                        icon={
                            <Icon
                                name={(isHidden ? 'show' : 'hide') as IconName}
                                size="sm"
                                alt={
                                    isHidden ? 'Unhide comment' : 'Hide comment'
                                }
                            />
                        }
                    />
                }
            >
                <TooltipContent
                    title={isHidden ? 'Unhide comment' : 'Hide comment'}
                />
            </Tooltip>
            <Tooltip
                trigger={
                    <ButtonGroupItem
                        id="copy"
                        icon={<CopyButton text={copyText} />}
                    />
                }
            >
                <TooltipContent title="Copy message" />
            </Tooltip>
        </ButtonGroup>
    )
}
