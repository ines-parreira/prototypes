import {fromJS} from 'immutable'

import {transformAttachmentToProduct} from '../transformAttachmentToProduct'

const EMPTY_ATTACHMENTS = fromJS([])
const ATTACHMENTS = fromJS([
    {
        content_type: 'application/productCard',
        name: 'MacBook Pro 13-inch',
        size: 0,
        url: 'https://cdn.shopify.com/s/files/1/0572/7505/6294/products/mbp-digitalmat-gallery-4-202206.png?v=1664370856',
        extra: {
            product_id: 7545464062118,
            product_link:
                'https://robertpmf.myshopify.com/products/macbook-pro-13-inch?variant=43508854358182&utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=Test+1',
            price: 1299,
            featured_image:
                'https://cdn.shopify.com/s/files/1/0572/7505/6294/products/mbp-digitalmat-gallery-4-202206.png?v=1664370856',
            variant_name: ' Color: Space Gray',
        },
    },
    {
        content_type: 'application/productCard',
        name: 'Apple Watch Ultra',
        size: 0,
        url: 'https://cdn.shopify.com/s/files/1/0572/7505/6294/products/watch-ultra-digitalmat-gallery-1-202209.jpg?v=1664371058',
        extra: {
            product_id: 7545470910630,
            currency: 'USD',
            product_link:
                'https://robertpmf.myshopify.com/products/apple-watch-ultra?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=Test+1',
            price: 799,
            featured_image:
                'https://cdn.shopify.com/s/files/1/0572/7505/6294/products/watch-ultra-digitalmat-gallery-1-202209.jpg?v=1664371058',
        },
    },
])

describe('transformAttachmentToProduct()', () => {
    it('should return empty array if attachments is empty', () => {
        expect(transformAttachmentToProduct(EMPTY_ATTACHMENTS, {})).toEqual([])
    })

    it('adds the integration currency code for products without one', () => {
        expect(
            transformAttachmentToProduct(ATTACHMENTS, {
                currency: 'GBP',
            })
        ).toMatchSnapshot()
    })
})
