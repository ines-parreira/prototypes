import { render, screen } from '@testing-library/react'

import MetafieldTypeItem from './MetafieldTypeItem'

describe('MetafieldTypeItem', () => {
    it('renders with correct icon and label for single_line_text type', () => {
        render(<MetafieldTypeItem type="single_line_text" />)

        expect(screen.getByText('Single-line text')).toBeInTheDocument()
    })

    it('renders with correct icon and label for boolean type', () => {
        render(<MetafieldTypeItem type="boolean" />)

        expect(screen.getByText('True or false')).toBeInTheDocument()
    })

    it('renders with correct icon and label for date_time type', () => {
        render(<MetafieldTypeItem type="date_time" />)

        expect(screen.getByText('Date and time')).toBeInTheDocument()
    })

    it('sets aria-disabled attribute on icon when disabled', () => {
        render(<MetafieldTypeItem type="single_line_text" disabled />)

        const icon = screen.getByRole('img', { hidden: true })
        expect(icon).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not set aria-disabled attribute on icon when not disabled', () => {
        render(<MetafieldTypeItem type="single_line_text" />)

        const icon = screen.getByRole('img', { hidden: true })
        expect(icon).not.toHaveAttribute('aria-disabled')
    })
})
