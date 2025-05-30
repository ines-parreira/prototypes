import { render } from '@testing-library/react'

import EmptyTicket from '../EmptyTicket'

describe('EmptyTicket', () => {
    it('applies custom className', () => {
        const customClass = 'custom-class'
        const { container } = render(<EmptyTicket className={customClass} />)

        expect(container.firstChild).toHaveClass(customClass)
    })
})
