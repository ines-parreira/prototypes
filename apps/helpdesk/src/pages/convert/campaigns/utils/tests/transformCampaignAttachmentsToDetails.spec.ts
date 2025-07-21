import { AttachmentEnum } from 'common/types'
import {
    campaignDiscountOfferAttachment,
    campaignProductAttachment,
    campaignProductRecommendationAttachment,
} from 'fixtures/campaign'
import { sampleContactFormAttachment } from 'pages/convert/campaigns/components/ContactCaptureForm/tests/fixtures'
import { transformCampaignAttachmentsToDetails } from 'pages/convert/campaigns/utils/transformCampaignAttachmentsToDetails'

describe('transformCampaignAttachmentsToDetails', () => {
    it('should transform product attachment', () => {
        const attachments = [campaignProductAttachment]
        const result = transformCampaignAttachmentsToDetails(attachments)
        expect(result).toEqual([
            {
                content_type: AttachmentEnum.Product,
                name: 'Thick socks',
                size: 44,
                url: 'https://athlete-shift.com/products/thick-socks',
                extra: {
                    product_id: 349348782,
                    product_link:
                        'https://athlete-shift.com/products/thick-socks-heart',
                    price: 12.34,
                    compare_at_price: 1200.34,
                    featured_image:
                        'https://athlete-shift.com/products/thick-socks',
                    variant_name: 'Thick socks with heart',
                    position: undefined,
                },
            },
        ])
    })

    it('should transform discount offer attachment', () => {
        const attachments = [campaignDiscountOfferAttachment]
        const result = transformCampaignAttachmentsToDetails(attachments)
        expect(result).toEqual([
            {
                content_type: AttachmentEnum.DiscountOffer,
                name: '10% off',
                extra: {
                    discount_offer_id: '10OFF',
                    summary: '10% off for everyone',
                },
            },
        ])
    })

    it('should transform product recommendation attachment', () => {
        const attachments = [campaignProductRecommendationAttachment]
        const result = transformCampaignAttachmentsToDetails(attachments)
        expect(result).toEqual([
            {
                content_type: AttachmentEnum.ProductRecommendation,
                name: 'Similar Browsed Products',
                extra: {
                    id: '01J4VH71YJ704QXCP4WDST3ZT3',
                    scenario: 'similar_seen',
                    description:
                        'Recommends based on visitors’ product pages browsed',
                },
            },
        ])
    })

    it('should transform contact form attachment', () => {
        const jsAttachment = sampleContactFormAttachment.toJS()
        const attachments = [jsAttachment]
        const { contentType: __, ...expected } = jsAttachment
        const result = transformCampaignAttachmentsToDetails(attachments)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expected.content_type = AttachmentEnum.ContactForm
        expect(result[0]).toMatchObject(expected)
    })
})
