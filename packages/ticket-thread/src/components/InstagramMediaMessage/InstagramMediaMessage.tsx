import type { ReactNode } from 'react'

import { replaceAttachmentURL } from '@repo/utils'

import type { TicketThreadSocialMediaInstagramMediaItem } from '../../hooks/messages/types'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { ViewOnInstagramLink } from './ViewOnInstagramLink'

import css from './InstagramMediaMessage.less'

type InstagramMediaMessageProps = {
    item: TicketThreadSocialMediaInstagramMediaItem
    actions?: ReactNode
}

export function InstagramMediaMessage({
    item,
    actions,
}: InstagramMediaMessageProps) {
    const source = item.data.source as any
    const channelFrom = source?.from?.name ?? null
    const channelTo = source?.to?.[0]?.name ?? null
    const permalink = source?.extra?.permalink ?? null
    const imageAttachments = item.data.attachments?.filter(
        (a) => a.content_type?.startsWith('image/') && a.url,
    )

    return (
        <SocialMessageBubble
            item={item}
            goToLink={null}
            channelName="Instagram media"
            channelFrom={channelFrom}
            channelTo={channelTo}
            actions={actions}
        >
            {permalink && <ViewOnInstagramLink href={permalink} />}
            {imageAttachments?.map((attachment) => (
                <img
                    key={attachment.url}
                    src={replaceAttachmentURL(attachment.url!)}
                    alt={attachment.name ?? 'Instagram media'}
                    className={css.image}
                />
            ))}
            <MessageBody item={item} />
        </SocialMessageBubble>
    )
}
