import {campaign, campaignVariant} from 'fixtures/campaign'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {createCampaignFromVariant} from '../createCampaignFromVariant'

const channelConnectionId = 'channelConnectionId'

describe('createCampaignFromVariant', () => {
    it('raises an error', () => {
        expect(() =>
            createCampaignFromVariant(
                campaign as Campaign,
                undefined,
                undefined
            )
        ).toThrow('Channel connection ID is required')
    })
    it('return new record with campaign content', () => {
        const payload = createCampaignFromVariant(
            campaign as Campaign,
            channelConnectionId,
            undefined
        )

        expect(payload.message_text).toEqual(campaign.message_text)
        expect(payload.message_html).toEqual(campaign.message_html)
        expect(payload.attachments).toEqual(campaign.attachments)
    })
    it('return new record with variant content', () => {
        const payload = createCampaignFromVariant(
            campaign as Campaign,
            channelConnectionId,
            campaignVariant
        )

        expect(payload.message_text).toEqual(campaignVariant.message_text)
        expect(payload.message_html).toEqual(campaignVariant.message_html)
        expect(payload.attachments).toEqual(campaignVariant.attachments)
    })
    it('return new record with campaign and handles undefined', () => {
        const payload = createCampaignFromVariant(
            {
                ...campaign,
                message_html: undefined,
                attachments: undefined,
            } as Campaign,
            channelConnectionId,
            undefined
        )

        expect(payload.message_html).toEqual('')
        expect(payload.attachments).toEqual([])
    })
    it('return new record with variant and handles undefined', () => {
        const payload = createCampaignFromVariant(
            campaign as Campaign,
            channelConnectionId,
            {
                ...campaignVariant,
                message_html: undefined,
                attachments: undefined,
            }
        )

        expect(payload.message_html).toEqual('')
        expect(payload.attachments).toEqual([])
    })
})
