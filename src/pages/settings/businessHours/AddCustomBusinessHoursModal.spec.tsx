import { fireEvent, render, screen } from '@testing-library/react'

import AddCustomBusinessHoursModal from './AddCustomBusinessHoursModal'

const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
}
const renderComponent = (props = defaultProps) => {
    return render(<AddCustomBusinessHoursModal {...props} />)
}

describe('AddCustomBusinessHoursModal', () => {
    it('renders the modal with correct title', () => {
        renderComponent()

        expect(
            screen.getByText('Add Custom Business Hours'),
        ).toBeInTheDocument()
    })

    it('renders both action buttons', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Add Business Hours' }),
        ).toBeInTheDocument()
    })

    it('calls onClose when Cancel button is clicked', () => {
        renderComponent()

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        fireEvent.click(cancelButton)

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
})
