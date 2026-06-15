import { MessageMetaLabel } from './MessageMetaLabel'
import { MessageMetaLink } from './MessageMetaLink'

type MessageCampaignLinkProps = {
    integrationId: string | number
    campaignId: string
}

export function MessageCampaignLink({
    integrationId,
    campaignId,
}: MessageCampaignLinkProps) {
    return (
        <MessageMetaLabel icon="zap">
            sent via{' '}
            <MessageMetaLink
                to={`/app/convert/${integrationId}/campaigns/${campaignId}`}
            >
                Campaign
            </MessageMetaLink>
        </MessageMetaLabel>
    )
}
