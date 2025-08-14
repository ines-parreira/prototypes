import { render, screen } from '@testing-library/react'

import { TicketInfobarNavigation } from '../TicketInfobarNavigation'

describe('TicketInfobarNavigation', () => {
    it('should render the infobar navigation', () => {
        render(<TicketInfobarNavigation />)
        expect(screen.getByTestId('infobar-navigation')).toBeInTheDocument()
    })
})
