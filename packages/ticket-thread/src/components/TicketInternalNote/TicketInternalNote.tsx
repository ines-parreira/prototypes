import { Box, IconName } from '@gorgias/axiom'

import type { TicketThreadInternalNoteItem } from '../../hooks/messages/types'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageFooter } from '../MessageBubble/components/MessageFooter'
import { MessageHeaderContainer } from '../MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '../MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageSender } from '../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../MessageBubble/MessageBubble'

import css from './TicketInternalNote.less'

type TicketInternalNoteProps = {
    item: TicketThreadInternalNoteItem
}

export function TicketInternalNote({ item }: TicketInternalNoteProps) {
    return (
        <MessageBubble variant="internal-note">
            <MessageHeaderContainer>
                <Box alignItems="center" gap="xs">
                    <MessageAvatar sender={item.data.sender} />
                    <MessageSender sender={item.data.sender} />
                </Box>
                <Box alignItems="center" gap="xs">
                    <MessageChannel
                        channel={item.data.channel}
                        createdDatetime={item.data.created_datetime}
                        channelIcon={IconName.Note}
                        variant="internal-note"
                    />
                    <MessageTimestamp
                        createdDatetime={item.data.created_datetime}
                    />
                </Box>
            </MessageHeaderContainer>
            <MessageBody item={item} className={css.internalNoteContent} />
            <MessageFooter item={item} showTranslations={false} />
        </MessageBubble>
    )
}
