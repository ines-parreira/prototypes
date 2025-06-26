import { render, screen, waitFor } from '@testing-library/react'
import fireEvent from '@testing-library/user-event'

import { assumeMock } from 'utils/testing'

import AddCustomBusinessHoursModal from '../AddCustomBusinessHoursModal'
import CustomBusinessHours from '../CustomBusinessHours'

jest.mock('../AddCustomBusinessHoursModal')

const AddBusinessHoursModalMock = assumeMock(AddCustomBusinessHoursModal)

const renderComponent = () => {
    return render(<CustomBusinessHours />)
}

describe('CustomBusinessHours', () => {
    beforeEach(() => {
        AddBusinessHoursModalMock.mockImplementation(({ isOpen, onClose }) => (
            <div>
                {isOpen ? 'MODAL_OPEN' : 'MODAL_CLOSED'}
                <button onClick={onClose}>Close Modal</button>
            </div>
        ))
    })

    it('renders the section header and Add button', () => {
        renderComponent()

        expect(screen.getByText('Custom Business Hours')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Add Custom Business Hours' }),
        ).toBeInTheDocument()
    })

    it('should render the modal closed by default', () => {
        renderComponent()

        expect(screen.getByText('MODAL_CLOSED')).toBeInTheDocument()
    })

    it('opens modal when add button is clicked', async () => {
        renderComponent()

        const button = screen.getByRole('button', {
            name: 'Add Custom Business Hours',
        })

        fireEvent.click(button)

        await waitFor(() => {
            expect(screen.getByText('MODAL_OPEN')).toBeInTheDocument()
        })
    })

    it('closes modal when modal close is triggered', () => {
        renderComponent()

        const closeButton = screen.getByRole('button', { name: 'Close Modal' })

        fireEvent.click(closeButton)

        expect(screen.getByText('MODAL_CLOSED')).toBeInTheDocument()
    })
})
