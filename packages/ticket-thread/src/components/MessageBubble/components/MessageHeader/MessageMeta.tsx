import { ForwardedLabel } from './ForwardedLabel'
import { getMessageCampaignId } from './getMessageCampaignId'
import { getMessageSearchQuery } from './getMessageSearchQuery'
import { MessageCampaignLink } from './MessageCampaignLink'
import { MessageSearchQuery } from './MessageSearchQuery'

type MessageMetaProps = {
    meta: unknown
    integrationId?: string | number | null
    isForwarded?: boolean
}

export function MessageMeta({
    meta,
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
        </>
    )
}
