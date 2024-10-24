import {variants as variantsFixtures} from 'fixtures/abGroup'
import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'

import {deleteVariant} from '../deleteVariant'

describe('deleteVariant', () => {
    it('deleted variant', () => {
        const newVariants = deleteVariant(
            variantsFixtures,
            variantsFixtures[1].id
        )

        expect(newVariants).toHaveLength(1)
        expect((newVariants as CampaignVariant[])[0].id).not.toEqual(
            variantsFixtures[1].id
        )
    })

    it('variant to delete does not exist', () => {
        const newVariants = deleteVariant(variantsFixtures, 'variant-to-delete')
        expect(newVariants).toBeUndefined()
    })
})
