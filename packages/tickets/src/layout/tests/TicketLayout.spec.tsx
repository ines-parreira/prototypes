import { render } from '@testing-library/react'

import { TicketLayout, TicketLayoutContent } from '../TicketLayout'

describe('TicketLayout', () => {
    it('should render the layout', () => {
        const { getByText } = render(<TicketLayout>Hello</TicketLayout>)
        expect(getByText('Hello')).toBeInTheDocument()
    })

    it('should render the content', () => {
        const { getByText } = render(
            <TicketLayoutContent>Hello</TicketLayoutContent>,
        )
        expect(getByText('Hello')).toBeInTheDocument()
    })
})
