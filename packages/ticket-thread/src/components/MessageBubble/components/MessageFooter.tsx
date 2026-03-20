import { isNumber } from 'lodash'

import { Box, Icon, IconName, Tag, TagColor } from '@gorgias/axiom'

import { useExpandedMessages } from '../../../contexts/ExpandedMessages'
import type {
    TicketThreadInternalNoteItem,
    TicketThreadRegularMessageItem,
} from '../../../hooks/messages/types'
import { MessageAttachments } from './MessageAttachments'
import { TranslationsDropdown } from './TranslationsDropdown'
import { getMessageContent } from './utils/getMessageContent'

import css from './MessageFooter.less'

type MessageFooterProps = {
    item: TicketThreadRegularMessageItem | TicketThreadInternalNoteItem
    showTranslations?: boolean
}

export function MessageFooter({
    item,
    showTranslations = true,
}: MessageFooterProps) {
    const { isStripped, messageId } = getMessageContent(item)
    const { toggleMessage } = useExpandedMessages()

    return (
        <Box flexDirection="column" gap="xs">
            {isStripped && (
                <Box>
                    <Tag
                        color={TagColor.Grey}
                        onClick={() => toggleMessage(messageId)}
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
            {showTranslations && isNumber(messageId) && (
                <TranslationsDropdown
                    messageId={messageId}
                    ticketId={item.data.ticket_id}
                />
            )}
            <MessageAttachments item={item} />
        </Box>
    )
}
