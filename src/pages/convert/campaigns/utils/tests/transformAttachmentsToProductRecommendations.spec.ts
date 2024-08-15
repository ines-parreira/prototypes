import {List} from 'immutable'
import {AttachmentEnum} from 'common/types'
import {ProductRecommendationScenario} from 'pages/convert/campaigns/types/CampaignAttachment'
import {transformAttachmentsToProductRecommendations} from '../transformAttachmentsToProductRecommendations'

describe('transformAttachmentsToProductRecommendations', () => {
    it('should return an empty array if no attachments are provided', () => {
        const attachments = List([])

        const result = transformAttachmentsToProductRecommendations(attachments)

        expect(result).toEqual([])
    })

    it('should return an empty array if no attachments are product recommendations', () => {
        const attachments = List([
            {
                content_type: 'image',
                name: 'image1',
                extra: {id: 1, scenario: 'scenario1'},
            },
            {
                content_type: 'image',
                name: 'image2',
                extra: {id: 2, scenario: 'scenario2'},
            },
        ])

        const result = transformAttachmentsToProductRecommendations(attachments)

        expect(result).toEqual([])
    })

    it('should return an array of product recommendations', () => {
        const attachments = List([
            {
                content_type: AttachmentEnum.ProductRecommendation,
                name: 'Yellow shirt',
                extra: {
                    id: '01J55AAS89MXWKTTDWK16J3MBA',
                    scenario: ProductRecommendationScenario.SimilarSeen,
                },
            },
            {
                content_type: 'image',
                name: 'image2',
                extra: {id: 2, scenario: 'scenario2'},
            },
        ])

        const result = transformAttachmentsToProductRecommendations(attachments)

        expect(result).toEqual([
            {
                contentType: AttachmentEnum.ProductRecommendation,
                name: 'Yellow shirt',
                extra: {
                    id: '01J55AAS89MXWKTTDWK16J3MBA',
                    scenario: ProductRecommendationScenario.SimilarSeen,
                },
            },
        ])
    })
})
