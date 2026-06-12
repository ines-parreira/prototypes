import { Box, Icon, Tag, TagColor } from '@gorgias/axiom'
import { isNumber } from '@gorgias/toolkit'

import { useExpandedMessages } from '../../../contexts/ExpandedMessages'
import type {
    TicketThreadAiAgentHandoverMessageItem,
    TicketThreadAiAgentMessageItem,
    TicketThreadInternalNoteItem,
    TicketThreadRegularMessageItem,
    TicketThreadSocialMediaFacebookCommentItem,
    TicketThreadSocialMediaFacebookMessageItem,
    TicketThreadSocialMediaFacebookPostItem,
    TicketThreadSocialMediaInstagramCommentItem,
    TicketThreadSocialMediaInstagramDirectMessageItem,
    TicketThreadSocialMediaInstagramMediaItem,
    TicketThreadSocialMediaInstagramStoryReplyItem,
    TicketThreadSocialMediaTwitterDirectMessageItem,
    TicketThreadSocialMediaTwitterTweetItem,
    TicketThreadSocialMediaWhatsAppMessageItem,
} from '../../../hooks/messages/types'
import { TicketThreadItemTag } from '../../../hooks/types'
import type { DisplayedTicketThreadMessageItem } from '../../TicketMessage/hooks/useDisplayedTicketMessage'
import type { MessageAttachmentsItem } from './MessageAttachments'
import { MessageAttachments } from './MessageAttachments'
import type { MessageVideosItem } from './MessageVideos'
import { MessageVideos } from './MessageVideos'
import { TranslationsDropdown } from './TranslationsDropdown'
import { useMessageTranslations } from './useMessageTranslations'
import { getMessageContent } from './utils/getMessageContent'
import { getMessageVideoUrls } from './utils/getMessageVideoUrls'

import css from './MessageFooter.less'

type MessageFooterBaseItem =
    | TicketThreadRegularMessageItem
    | TicketThreadInternalNoteItem
    | TicketThreadAiAgentMessageItem
    | TicketThreadAiAgentHandoverMessageItem
    | TicketThreadSocialMediaFacebookCommentItem
    | TicketThreadSocialMediaFacebookMessageItem
    | TicketThreadSocialMediaFacebookPostItem
    | TicketThreadSocialMediaInstagramCommentItem
    | TicketThreadSocialMediaInstagramDirectMessageItem
    | TicketThreadSocialMediaInstagramMediaItem
    | TicketThreadSocialMediaInstagramStoryReplyItem
    | TicketThreadSocialMediaTwitterDirectMessageItem
    | TicketThreadSocialMediaTwitterTweetItem
    | TicketThreadSocialMediaWhatsAppMessageItem

export type MessageFooterItem =
    | MessageFooterBaseItem
    | DisplayedTicketThreadMessageItem<MessageFooterBaseItem>

type MessageFooterProps = {
    item: MessageFooterItem
    showTranslations?: boolean
    showAttachments?: boolean
    showVideos?: boolean
}

type MessageFooterAttachmentsItem = Extract<
    MessageFooterItem,
    MessageAttachmentsItem
>

type MessageFooterVideosItem = Extract<MessageFooterItem, MessageVideosItem>

function canRenderAttachments(
    item: MessageFooterItem,
): item is MessageFooterAttachmentsItem {
    return (
        item._tag === TicketThreadItemTag.Messages.Message ||
        item._tag === TicketThreadItemTag.Messages.InternalNote ||
        item._tag === TicketThreadItemTag.Messages.AiAgentMessage ||
        item._tag === TicketThreadItemTag.Messages.AiAgentHandoverMessage ||
        item._tag === TicketThreadItemTag.Messages.SocialMediaFacebookMessage ||
        item._tag ===
            TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage ||
        item._tag === TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage
    )
}

function canRenderVideos(
    item: MessageFooterItem,
): item is MessageFooterVideosItem {
    return canRenderAttachments(item)
}

export function MessageFooter({
    item,
    showTranslations = true,
    showAttachments = true,
    showVideos = true,
}: MessageFooterProps) {
    const { toggleMessage, isMessageExpanded } = useExpandedMessages()
    const { isStripped, messageId } = getMessageContent(item)
    const isExpanded = isMessageExpanded(messageId)
    const messageIdForTranslations = isNumber(messageId) ? messageId : null
    const translationsState = useMessageTranslations({
        messageId,
        ticketId: item.data.ticket_id,
        showTranslations,
    })
    const videoUrls = showVideos ? getMessageVideoUrls(item, isExpanded) : null
    const shouldRenderAttachments =
        showAttachments && canRenderAttachments(item)
    const hasAttachments =
        shouldRenderAttachments && Boolean(item.data.attachments?.length)
    const translationsDropdown =
        translationsState.shouldRender && messageIdForTranslations !== null ? (
            <TranslationsDropdown
                messageId={messageIdForTranslations}
                ticketId={item.data.ticket_id}
            />
        ) : null
    const shouldRenderEmailThreadActions =
        isStripped &&
        item.data.channel === 'email' &&
        translationsDropdown !== null

    if (
        !isStripped &&
        !translationsState.shouldRender &&
        !videoUrls?.length &&
        !hasAttachments
    ) {
        return null
    }

    return (
        <Box flexDirection="column" gap="xs">
            {isStripped && (
                <Box
                    alignItems="center"
                    gap="xxxs"
                    data-email-thread-actions={
                        shouldRenderEmailThreadActions ? true : undefined
                    }
                >
                    <Tag
                        color={TagColor.Grey}
                        onClick={() => {
                            toggleMessage(messageId)
                        }}
                        size="sm"
                        className={css.tag}
                    >
                        <Icon name="dots-meatballs-horizontal" size="sm" />
                    </Tag>
                    {shouldRenderEmailThreadActions
                        ? translationsDropdown
                        : null}
                </Box>
            )}
            {showVideos && canRenderVideos(item) && (
                <MessageVideos item={item} />
            )}
            {shouldRenderEmailThreadActions ? null : translationsDropdown}
            {shouldRenderAttachments && <MessageAttachments item={item} />}
        </Box>
    )
}
