import { getMessageCampaignId } from './getMessageCampaignId'
import { getMessageSearchQuery } from './getMessageSearchQuery'
import { MessageCampaignLink } from './MessageCampaignLink'
import { MessageSearchQuery } from './MessageSearchQuery'

type MessageMetaProps = {
    meta: unknown
    integrationId?: string | number | null
}

export function MessageMeta({ meta, integrationId }: MessageMetaProps) {
    const searchQuery = getMessageSearchQuery(meta)
    const campaignId = getMessageCampaignId(meta)

    return (
        <>
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
