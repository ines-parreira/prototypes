import { render, screen } from '@testing-library/react'

import { Footer } from './Footer'

describe('Footer', () => {
    it('should render discount information when maxDiscount is provided', () => {
        render(<Footer totalSent={'100'} maxDiscount={20} />)

        expect(screen.getByText('Discount 20%')).toBeInTheDocument()
        expect(screen.getByText('Total sent 100')).toBeInTheDocument()
    })

    it('should not render discount info icon when maxDiscount is not provided', () => {
        render(<Footer totalSent={'100'} />)

        expect(screen.queryByText('Discount')).not.toBeInTheDocument()
        expect(screen.queryByText('info_outline')).not.toBeInTheDocument()
    })

    it('should not render discount information when maxDiscount is 0', () => {
        render(<Footer totalSent={'100'} maxDiscount={0} />)

        expect(screen.queryByText('Discount')).not.toBeInTheDocument()
        expect(screen.queryByText('info_outline')).not.toBeInTheDocument()
    })
})
