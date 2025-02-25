import { List } from 'immutable'

import {
    attachmentIsProductRecommendation,
    AttachmentType,
    CampaignProductRecommendation,
} from 'pages/convert/campaigns/types/CampaignAttachment'

export const transformAttachmentsToProductRecommendations = (
    attachments: List<any>,
): CampaignProductRecommendation[] => {
    const attachmentsJS: AttachmentType[] = attachments.toJS()

    return attachmentsJS
        .filter(attachmentIsProductRecommendation)
        .map((att) => {
            return {
                contentType: att.content_type,
                name: att.name,
                extra: {
                    id: att.extra.id,
                    scenario: att.extra.scenario,
                },
            }
        })
}
