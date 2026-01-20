import { render, screen } from '@testing-library/react'

import type { MetafieldType } from '@gorgias/helpdesk-types'

import MetafieldTypeItem from './MetafieldTypeItem'

describe('MetafieldTypeItem', () => {
    it('renders with correct icon and label for single_line_text_field type', () => {
        render(<MetafieldTypeItem type="single_line_text_field" />)

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
        render(<MetafieldTypeItem type="single_line_text_field" disabled />)

        const icon = screen.getByRole('img', { hidden: true })
        expect(icon).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not set aria-disabled attribute on icon when not disabled', () => {
        render(<MetafieldTypeItem type="single_line_text_field" />)

        const icon = screen.getByRole('img', { hidden: true })
        expect(icon).not.toHaveAttribute('aria-disabled')
    })

    it('handles unknown type by not rendering icon', () => {
        render(<MetafieldTypeItem type={'unknown_type' as MetafieldType} />)

        expect(
            screen.queryByRole('img', { hidden: true }),
        ).not.toBeInTheDocument()
    })
})
