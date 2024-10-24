import {variants as variantsFixtures} from 'fixtures/abGroup'
import {campaign} from 'fixtures/campaign'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'

import {createVariant} from '../createVariant'

describe('createVariant', () => {
    it('create variant if list contains variant placeholder', () => {
        const [newVariantId, variants] = createVariant(
            [{message_text: '', message_html: ''}] as CampaignVariant[],
            campaign as Campaign
        )

        expect(newVariantId).not.toBeUndefined()
        expect(variants).toHaveLength(1)
        expect(variants[0].message_html).toEqual(campaign.message_html)
        expect(variants[0].message_text).toEqual(campaign.message_text)
        expect(variants[0].attachments).toEqual(campaign.attachments)
    })

    it('create variant if list have variants and variant placeholder', () => {
        const [newVariantId, variants] = createVariant(
            [
                ...variantsFixtures,
                {message_text: '', message_html: ''},
            ] as CampaignVariant[],
            campaign as Campaign
        )

        expect(newVariantId).not.toBeUndefined()
        expect(variants).toHaveLength(3)

        const variant = variants.find(
            (item) => item.id === newVariantId
        ) as CampaignVariant
        expect(variant).not.toBeUndefined()
        expect(variant.message_html).toEqual(campaign.message_html)
        expect(variant.message_text).toEqual(campaign.message_text)
        expect(variant.attachments).toEqual(campaign.attachments)
    })

    it('placehoulder does not exist', () => {
        const [newVariantId, variants] = createVariant(
            [...variantsFixtures] as CampaignVariant[],
            campaign as Campaign
        )

        expect(newVariantId).toBeUndefined()
        expect(variants).toHaveLength(0)
    })
})
