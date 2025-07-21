import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { ProductDisplayer } from './ProductDisplayer'

describe('<ProductDisplayer />', () => {
    const defaultProps = {
        id: '3219312',
        title: 'New Balance 2002R',
        image: 'image',
        variantTitle: 'variant title 1',
    }

    it('should render product code and name', () => {
        render(<ProductDisplayer {...defaultProps} />)

        expect(screen.getByText('New Balance 2002R')).toBeInTheDocument()
        expect(screen.getByText('variant title 1')).toBeInTheDocument()
    })

    it('should render product image placeholder', () => {
        render(<ProductDisplayer {...defaultProps} />)

        const image = screen.getByAltText('product-placeholder')
        expect(image).toBeInTheDocument()
    })

    it('should call onClick when clicked', async () => {
        const mockOnClick = jest.fn()
        render(<ProductDisplayer {...defaultProps} onClick={mockOnClick} />)

        const listItem = screen.getByRole('listitem')
        await userEvent.click(listItem)

        expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
})
