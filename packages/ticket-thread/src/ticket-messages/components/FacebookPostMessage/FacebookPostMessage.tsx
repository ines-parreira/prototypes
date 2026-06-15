import { replaceAttachmentURL } from '@repo/utils'

import type { TicketThreadSocialMediaFacebookPostItem } from '../../types'
import { buildGoToLink } from '../../utils/buildGoToLink'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageFooter } from '../MessageBubble/components/MessageFooter'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { ViewOnSocialLink } from '../SocialMessageBubble/ViewOnSocialLink'
import { useDisplayedTicketMessage } from '../TicketMessage/hooks/useDisplayedTicketMessage'
import { TicketMessageActions } from '../TicketMessageActions/TicketMessageActions'

import css from '../SocialMessageBubble/SocialMessageBubble.less'

type FacebookPostMessageProps = {
    item: TicketThreadSocialMediaFacebookPostItem
}

export function FacebookPostMessage({ item }: FacebookPostMessageProps) {
    const displayedItem = useDisplayedTicketMessage({ item })
    const message = displayedItem.data
    const goToLink = buildGoToLink({
        source: message.source,
        meta: message.meta,
        messageId: message.message_id ?? undefined,
        integrationId: message.integration_id,
        externalId: message.external_id,
        messageCreatedDatetime: message.created_datetime,
    })
    const source = message.source
    const channelFrom = source.from?.name ?? null
    const channelTo = source.to?.[0]?.name ?? null
    const imageAttachments = message.attachments?.filter(
        (a) => a.content_type?.startsWith('image/') && a.url,
    )
    const videoAttachments = message.attachments?.filter(
        (a) => a.content_type?.startsWith('video/') && a.url,
    )

    return (
        <SocialMessageBubble
            item={displayedItem}
            goToLink={null}
            channelName="Facebook post"
            channelFrom={channelFrom}
            channelTo={channelTo}
            failedMessageError="We couldn't deliver your post"
        >
            {goToLink && (
                <ViewOnSocialLink
                    href={goToLink.link}
                    label="view post on"
                    platform="Facebook"
                />
            )}
            <MessageBody item={displayedItem} />
            <MessageFooter item={displayedItem} />
            {imageAttachments?.map((attachment) => (
                <img
                    key={attachment.url}
                    src={replaceAttachmentURL(attachment.url!)}
                    alt={attachment.name ?? 'Facebook media'}
                    className={css.image}
                />
            ))}
            {videoAttachments?.map((attachment) => (
                <video
                    key={attachment.url}
                    src={replaceAttachmentURL(attachment.url!)}
                    aria-label={attachment.name ?? 'Facebook video'}
                    controls
                    className={css.video}
                />
            ))}
            <TicketMessageActions message={message} />
        </SocialMessageBubble>
    )
}
