import { replaceAttachmentURL } from '@repo/utils'

import type { TicketThreadSocialMediaFacebookPostItem } from '../../hooks/messages/types'
import { buildGoToLink } from '../../utils/buildGoToLink'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageErrors } from '../MessageBubble/components/MessageErrors'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { ViewOnSocialLink } from '../SocialMessageBubble/ViewOnSocialLink'
import { TicketMessageActions } from '../TicketMessageActions/TicketMessageActions'

import css from '../SocialMessageBubble/SocialMessageBubble.less'

type FacebookPostMessageProps = {
    item: TicketThreadSocialMediaFacebookPostItem
}

export function FacebookPostMessage({ item }: FacebookPostMessageProps) {
    const goToLink = buildGoToLink({
        source: item.data.source,
        meta: item.data.meta,
        messageId: item.data.message_id ?? undefined,
        integrationId: item.data.integration_id,
        externalId: item.data.external_id,
        messageCreatedDatetime: item.data.created_datetime,
    })
    const source = item.data.source
    const channelFrom = source.from?.name ?? null
    const channelTo = source.to?.[0]?.name ?? null
    const imageAttachments = item.data.attachments?.filter(
        (a) => a.content_type?.startsWith('image/') && a.url,
    )
    const videoAttachments = item.data.attachments?.filter(
        (a) => a.content_type?.startsWith('video/') && a.url,
    )

    return (
        <SocialMessageBubble
            item={item}
            goToLink={null}
            channelName="Facebook post"
            channelFrom={channelFrom}
            channelTo={channelTo}
            hasFailed={!!item.data.failed_datetime}
            errors={
                item.data.ticket_id ? (
                    <MessageErrors
                        message={item.data}
                        ticketId={item.data.ticket_id}
                        failedMessageError="We couldn't deliver your direct message"
                    />
                ) : undefined
            }
        >
            {goToLink && (
                <ViewOnSocialLink
                    href={goToLink.link}
                    label="view post on"
                    platform="Facebook"
                />
            )}
            <MessageBody item={item} />
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
            <TicketMessageActions message={item.data} />
        </SocialMessageBubble>
    )
}
