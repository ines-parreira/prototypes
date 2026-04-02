import { isNumber } from 'lodash'

import { Box, Icon, IconName, Tag, TagColor } from '@gorgias/axiom'

import { useExpandedMessages } from '../../../contexts/ExpandedMessages'
import type {
    TicketThreadInternalNoteItem,
    TicketThreadRegularMessageItem,
} from '../../../hooks/messages/types'
import { MessageAttachments } from './MessageAttachments'
import { MessageVideos } from './MessageVideos'
import { TranslationsDropdown } from './TranslationsDropdown'
import { useMessageTranslations } from './useMessageTranslations'
import { getMessageContent } from './utils/getMessageContent'
import { getMessageVideoUrls } from './utils/getMessageVideoUrls'

import css from './MessageFooter.less'

type MessageFooterProps = {
    item: TicketThreadRegularMessageItem | TicketThreadInternalNoteItem
    showTranslations?: boolean
}

export function MessageFooter({
    item,
    showTranslations = true,
}: MessageFooterProps) {
    const { toggleMessage, isMessageExpanded } = useExpandedMessages()
    const { isStripped, messageId } = getMessageContent(item)
    const isExpanded = isMessageExpanded(messageId)
    const translationsState = useMessageTranslations({
        messageId,
        ticketId: item.data.ticket_id,
        showTranslations,
    })
    const videoUrls = getMessageVideoUrls(item, isExpanded)
    const hasAttachments = Boolean(item.data.attachments?.length)

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
                <Box>
                    <Tag
                        color={TagColor.Grey}
                        onClick={() => {
                            toggleMessage(messageId)
                        }}
                        size="sm"
                        className={css.tag}
                    >
                        <Icon
                            name={IconName.DotsMeatballsHorizontal}
                            size="sm"
                        />
                    </Tag>
                </Box>
            )}
            <MessageVideos item={item} />
            {translationsState.shouldRender && isNumber(messageId) ? (
                <TranslationsDropdown
                    messageId={messageId}
                    ticketId={item.data.ticket_id}
                />
            ) : null}
            <MessageAttachments item={item} />
        </Box>
    )
}
