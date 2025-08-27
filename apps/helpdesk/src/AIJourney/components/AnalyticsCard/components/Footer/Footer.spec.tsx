import { render, screen } from '@testing-library/react'

import { Footer } from './Footer'

describe('Footer', () => {
    it('should render discount information when discount is enabled', () => {
        render(<Footer maxDiscount={20} isDiscountEnabled={true} />)

        expect(screen.getByText('Discount 20%')).toBeInTheDocument()
    })

    it('should not render discount information when discount is disabled', () => {
        render(<Footer isDiscountEnabled={false} maxDiscount={99} />)

        expect(screen.queryByText('Discount')).not.toBeInTheDocument()
        expect(screen.queryByText('info_outline')).not.toBeInTheDocument()
    })
})
