import { fireEvent, render, screen } from '@testing-library/react'

import { StatusFilter } from '../StatusFilter'

describe('StatusFilter', () => {
    it('should render the filter name', () => {
        render(
            <StatusFilter
                selectedStatus={['open']}
                toggleSelectedStatus={jest.fn()}
            />,
        )
        expect(screen.getByText('status')).toBeInTheDocument()
    })

    it('should call toggleSelectedStatus when an option is clicked', () => {
        const toggleSelectedStatus = jest.fn()
        render(
            <StatusFilter
                selectedStatus={['open']}
                toggleSelectedStatus={toggleSelectedStatus}
            />,
        )

        fireEvent.click(screen.getByText('Open'))
        fireEvent.click(screen.getByText('Closed'))
        expect(toggleSelectedStatus).toHaveBeenCalledWith('closed')
    })
})
