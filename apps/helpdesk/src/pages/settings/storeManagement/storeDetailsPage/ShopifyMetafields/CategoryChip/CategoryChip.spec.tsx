import { render, screen } from '@testing-library/react'

import CategoryChip from './CategoryChip'

describe('CategoryChip', () => {
    it('should render Customer category with correct label', () => {
        render(<CategoryChip category="Customer" />)

        expect(screen.getByText('Customer')).toBeInTheDocument()
    })

    it('should render Order category with correct label', () => {
        render(<CategoryChip category="Order" />)

        expect(screen.getByText('Order')).toBeInTheDocument()
    })

    it('should render DraftOrder category with correct label', () => {
        render(<CategoryChip category="DraftOrder" />)

        expect(screen.getByText('Draft Order')).toBeInTheDocument()
    })
})
