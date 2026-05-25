import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { ForwardedLabel } from './ForwardedLabel'
import { getMessageCampaignId } from './getMessageCampaignId'
import { getMessageSearchQuery } from './getMessageSearchQuery'
import { MessageCampaignLink } from './MessageCampaignLink'
import { MessageReviewMeta } from './MessageReviewMeta'
import { MessageSearchQuery } from './MessageSearchQuery'

type MessageMetaProps = {
    meta: unknown
    messageId?: string | number | null
    source?: TicketMessage['source'] | null
    integrationId?: string | number | null
    isForwarded?: boolean
}

export function MessageMeta({
    meta,
    messageId,
    source,
    integrationId,
    isForwarded = false,
}: MessageMetaProps) {
    const searchQuery = getMessageSearchQuery(meta)
    const campaignId = getMessageCampaignId(meta)

    return (
        <>
            {isForwarded && <ForwardedLabel />}
            {searchQuery && <MessageSearchQuery query={searchQuery} />}
            {campaignId && integrationId && (
                <MessageCampaignLink
                    integrationId={integrationId}
                    campaignId={campaignId}
                />
            )}
            <MessageReviewMeta messageId={messageId} source={source} />
        </>
    )
}
