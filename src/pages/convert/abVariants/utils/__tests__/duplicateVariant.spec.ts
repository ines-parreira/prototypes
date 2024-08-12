import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'

import {campaign} from 'fixtures/campaign'
import {variants as variantsFixtures} from 'fixtures/abGroup'

import {duplicateVariant} from '../duplicateVariant'

describe('duplicateVariant', () => {
    it('duplicates CampaignVariant', () => {
        const variantIdToDuplicate = variantsFixtures[1].id
        const [newVariantId, variants] = duplicateVariant(
            variantsFixtures as CampaignVariant[],
            campaign as Campaign,
            variantIdToDuplicate
        )

        expect(newVariantId).not.toBeUndefined()
        expect(variants).toHaveLength(3)

        const oldVariant = variants?.find(
            (item) => item.id === variantIdToDuplicate
        ) as CampaignVariant

        const duplicatedVariant = variants?.find(
            (item) => item.id === newVariantId
        ) as CampaignVariant

        expect(duplicatedVariant.message_html).toEqual(oldVariant.message_html)
        expect(duplicatedVariant.message_text).toEqual(oldVariant.message_text)
        expect(duplicatedVariant.attachments).toEqual(oldVariant.attachments)
    })

    it('duplicate variant from control version', () => {
        const [newVariantId, variants] = duplicateVariant(
            [],
            campaign as Campaign,
            null
        )

        expect(newVariantId).not.toBeUndefined()
        expect(variants).toHaveLength(1)

        const duplicatedVariant = variants?.find(
            (item) => item.id === newVariantId
        ) as CampaignVariant

        expect(duplicatedVariant.message_html).toEqual(campaign.message_html)
        expect(duplicatedVariant.message_text).toEqual(campaign.message_text)
        expect(duplicatedVariant.attachments).toEqual(campaign.attachments)
    })

    it('variantId does not exist', () => {
        const [newVariantId, variants] = duplicateVariant(
            variantsFixtures as CampaignVariant[],
            campaign as Campaign,
            'fake-id'
        )

        expect(newVariantId).toBeUndefined()
        expect(variants).toHaveLength(0)
    })
})
