import { fireEvent, render, screen } from '@testing-library/react'

import { TicketStatusFilter } from '../TicketStatusFilter'

describe('StatusFilter', () => {
    it('should render the filter name', () => {
        render(
            <TicketStatusFilter
                selectedStatus={['open']}
                toggleSelectedStatus={jest.fn()}
                isDisabled={false}
            />,
        )
        expect(screen.getByText('ticket status')).toBeInTheDocument()
    })

    it('should call toggleSelectedStatus when an option is clicked', () => {
        const toggleSelectedStatus = jest.fn()
        render(
            <TicketStatusFilter
                selectedStatus={['open']}
                toggleSelectedStatus={toggleSelectedStatus}
                isDisabled={false}
            />,
        )

        fireEvent.click(screen.getByText('Open'))
        fireEvent.click(screen.getByText('Closed'))
        expect(toggleSelectedStatus).toHaveBeenCalledWith('closed')
    })
})
