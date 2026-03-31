import type { TicketMessageAttachment } from '@gorgias/helpdesk-types'

import { getProductAttachmentData } from '../utils/product'

function makeAttachment(
    overrides: Partial<TicketMessageAttachment>,
): TicketMessageAttachment {
    return {
        name: 'Classic Tee',
        url: 'https://cdn.example.com/product.png',
        content_type: 'application/productCard',
        public: true,
        ...overrides,
    } as TicketMessageAttachment
}

describe('getProductAttachmentData', () => {
    it('returns normalized product attachment data', () => {
        expect(
            getProductAttachmentData(
                makeAttachment({
                    extra: {
                        price: 31.24,
                        compare_at_price: 55.55,
                        variant_name: 'Blue / M',
                        product_link:
                            'https://shop.example.com/products/classic-tee',
                        currency: 'USD',
                    },
                }),
            ),
        ).toEqual({
            link: 'https://shop.example.com/products/classic-tee',
            variantName: 'Blue / M',
            currencyCode: 'USD',
            price: '31.24',
            compareAtPrice: '55.55',
        })
    })

    it('falls back when product metadata is missing', () => {
        expect(
            getProductAttachmentData(
                makeAttachment({
                    extra: undefined,
                }),
            ),
        ).toEqual({
            link: '#',
            variantName: null,
            currencyCode: null,
            price: undefined,
            compareAtPrice: undefined,
        })
    })
})
