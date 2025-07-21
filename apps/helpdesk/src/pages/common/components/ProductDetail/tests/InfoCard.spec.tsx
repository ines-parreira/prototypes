import React from 'react'

import { render, screen } from '@testing-library/react'

import InfoCard from 'pages/common/components/ProductDetail/InfoCard'

import { dummyInfocard } from './fixtures'

describe(`InfoCard`, () => {
    it('should not render', () => {
        const { container } = render(<InfoCard {...dummyInfocard} isHidden />)

        expect(container.firstChild).toBe(null)
    })

    describe('WhatsApp banner', () => {
        it('should render WhatsApp banner when type is whatsapp', () => {
            render(<InfoCard {...dummyInfocard} type="whatsapp" />)

            expect(
                screen.getByText(
                    /We are currently unable to onboard new WhatsApp integrations/i,
                ),
            ).toBeInTheDocument()
        })

        it('should not render WhatsApp banner when type is not whatsapp', () => {
            render(<InfoCard {...dummyInfocard} type="instagram" />)

            expect(
                screen.queryByText(
                    /We are currently unable to onboard new WhatsApp integrations/i,
                ),
            ).not.toBeInTheDocument()
        })

        it('should not render WhatsApp banner when type is not provided', () => {
            render(<InfoCard {...dummyInfocard} />)

            expect(
                screen.queryByText(
                    /We are currently unable to onboard new WhatsApp integrations/i,
                ),
            ).not.toBeInTheDocument()
        })
    })
})
