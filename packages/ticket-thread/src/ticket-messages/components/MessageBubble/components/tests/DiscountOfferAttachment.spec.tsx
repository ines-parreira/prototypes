import { screen } from '@testing-library/react'

import type { TicketMessageAttachment } from '@gorgias/helpdesk-types'

import { render } from '../../../../../tests/render.utils'
import { DiscountOfferAttachment } from '../DiscountOfferAttachment'

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

describe('DiscountOfferAttachment', () => {
    it('renders the discount offer card', () => {
        render(
            <DiscountOfferAttachment
                attachment={makeAttachment({
                    name: 'Spring campaign offer',
                    extra: {
                        discount_offer_code: '10OFF',
                        discount_offer_type: 'percentage',
                        discount_offer_value: 10,
                        discount_offer_id: '10OFF',
                    },
                })}
            />,
        )

        expect(screen.getByText('10OFF')).toBeInTheDocument()
        expect(screen.getByText('10% off')).toBeInTheDocument()
        expect(
            screen.getByText('Discount code shared with customer'),
        ).toBeInTheDocument()
    })
})
