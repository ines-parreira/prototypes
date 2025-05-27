import { render, screen } from '@testing-library/react'

import EmptyTicket from '../EmptyTicket'

describe('EmptyTicket', () => {
    it('renders with title', () => {
        const title = 'Test Title'
        render(<EmptyTicket title={title} />)

        expect(screen.getByText(title)).toBeInTheDocument()
    })

    it('applies custom className', () => {
        const customClass = 'custom-class'
        const { container } = render(<EmptyTicket className={customClass} />)

        expect(container.firstChild).toHaveClass(customClass)
    })
})
