import type { TicketMessageAttachment } from '@gorgias/helpdesk-types'

import { getDiscountOfferAttachmentData } from '../utils/discountOffer'

function makeAttachment(
    overrides: Partial<TicketMessageAttachment>,
): TicketMessageAttachment {
    return {
        name: 'discount-offer',
        url: 'https://cdn.example.com/discount-offer',
        content_type: 'application/discountOffer',
        public: true,
        ...overrides,
    } as TicketMessageAttachment
}

describe('getDiscountOfferAttachmentData', () => {
    it('returns the discount code and computed summary when available', () => {
        expect(
            getDiscountOfferAttachmentData(
                makeAttachment({
                    name: 'Spring campaign offer',
                    extra: {
                        discount_offer_code: '10OFF',
                        discount_offer_type: 'percentage',
                        discount_offer_value: 10,
                        discount_offer_id: '10OFF',
                    },
                }),
            ),
        ).toEqual({
            name: '10OFF',
            summary: '10% off',
        })
    })

    it('falls back to the attachment name and summary when no computed summary is available', () => {
        expect(
            getDiscountOfferAttachmentData(
                makeAttachment({
                    name: 'Spring campaign offer',
                    extra: {
                        summary: '20% off selected items',
                        discount_offer_code: 'SPRING20',
                    },
                }),
            ),
        ).toEqual({
            name: 'Spring campaign offer',
            summary: '20% off selected items',
        })
    })
})
