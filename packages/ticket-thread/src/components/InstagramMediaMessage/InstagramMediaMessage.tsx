import { replaceAttachmentURL } from '@repo/utils'

import type { TicketThreadSocialMediaInstagramMediaItem } from '../../hooks/messages/types'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageFooter } from '../MessageBubble/components/MessageFooter'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { useDisplayedTicketMessage } from '../TicketMessage/hooks/useDisplayedTicketMessage'
import { TicketMessageActions } from '../TicketMessageActions/TicketMessageActions'
import type { InstagramMentionType } from './ViewOnInstagramLink'
import { ViewOnInstagramLink } from './ViewOnInstagramLink'

import css from '../SocialMessageBubble/SocialMessageBubble.less'

type InstagramMediaMessageProps = {
    item: TicketThreadSocialMediaInstagramMediaItem
}

function getInstagramMentionType(
    sourceType: string,
    mediaType: string | null | undefined,
): InstagramMentionType | null {
    if (sourceType === 'instagram-mention-comment') return 'comment'
    if (sourceType === 'instagram-mention-media') {
        return mediaType === 'STORY' ? 'story' : 'post'
    }
    return null
}

export function InstagramMediaMessage({ item }: InstagramMediaMessageProps) {
    const displayedItem = useDisplayedTicketMessage({ item })
    const source = displayedItem.data.source
    const channelFrom = source?.from?.name ?? null
    const channelTo = source?.to?.[0]?.name ?? null
    const permalink = source?.extra?.permalink ?? null
    const fromAgent = displayedItem.data.from_agent ?? false
    const mentionType = fromAgent
        ? null
        : getInstagramMentionType(source?.type ?? '', source?.extra?.media_type)
    const imageAttachments = displayedItem.data.attachments?.filter(
        (a) => a.content_type?.startsWith('image/') && a.url,
    )
    const videoAttachments = displayedItem.data.attachments?.filter(
        (a) => a.content_type?.startsWith('video/') && a.url,
    )

    return (
        <SocialMessageBubble
            item={displayedItem}
            goToLink={null}
            channelName="Instagram media"
            channelFrom={channelFrom}
            channelTo={channelTo}
        >
            {(mentionType || permalink) && (
                <ViewOnInstagramLink
                    href={permalink ?? undefined}
                    mentionType={mentionType ?? undefined}
                />
            )}
            {imageAttachments?.map((attachment) => (
                <img
                    key={attachment.url}
                    src={replaceAttachmentURL(attachment.url!)}
                    alt={attachment.name ?? 'Instagram media'}
                    className={css.image}
                />
            ))}
            {videoAttachments?.map((attachment) => (
                <video
                    key={attachment.url}
                    src={replaceAttachmentURL(attachment.url!)}
                    aria-label={attachment.name ?? 'Instagram video'}
                    controls
                    className={css.video}
                />
            ))}
            <MessageBody item={displayedItem} />
            <MessageFooter item={displayedItem} />
            <TicketMessageActions message={displayedItem.data} />
        </SocialMessageBubble>
    )
}
