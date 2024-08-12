import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'

import {campaign} from 'fixtures/campaign'
import {variants as variantsFixtures} from 'fixtures/abGroup'

import {updateVariant} from '../updateVariant'

describe('updateVariant', () => {
    it('updates variant with new data', () => {
        const variantIdToUpdate = variantsFixtures[1].id

        const variants = updateVariant(
            variantsFixtures as CampaignVariant[],
            campaign as Campaign,
            variantIdToUpdate
        )

        expect(variants).toHaveLength(2)

        const variant = variants?.find(
            (item) => item.id === variantIdToUpdate
        ) as CampaignVariant
        expect(variant.message_html).toEqual(campaign.message_html)
        expect(variant.message_text).toEqual(campaign.message_text)
        expect(variant.attachments).toEqual(campaign.attachments)
    })

    it('variant to update does not exist', () => {
        const variants = updateVariant(
            variantsFixtures as CampaignVariant[],
            campaign as Campaign,
            'fake-variant-id'
        )

        expect(variants).toBeUndefined()
    })
})
