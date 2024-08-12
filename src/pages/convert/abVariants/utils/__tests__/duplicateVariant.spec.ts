import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'

import {variants as variantsFixtures} from 'fixtures/abGroup'

import {duplicateVariant} from '../duplicateVariant'

describe('duplicateVariant', () => {
    it('duplicates CampaignVariant', () => {
        const variantIdToDuplicate = variantsFixtures[1].id
        const [newVariantId, variants] = duplicateVariant(
            variantsFixtures as CampaignVariant[],
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

    it('variantId does not exist', () => {
        const [newVariantId, variants] = duplicateVariant(
            variantsFixtures as CampaignVariant[],
            'fake-id'
        )

        expect(newVariantId).toBeUndefined()
        expect(variants).toHaveLength(0)
    })
})
