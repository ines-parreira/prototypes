import { fireEvent, render, screen } from '@testing-library/react'

import { DeleteModal } from '../DeleteModal'

describe('DeleteModal', () => {
    const defaultProps = {
        isDeleting: false,
        isModalOpen: true,
        name: 'Test Business Hours',
        onDelete: jest.fn(),
        setModalOpen: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders modal with correct content when open', () => {
        render(<DeleteModal {...defaultProps} />)

        expect(screen.getByText('Delete business hours?')).toBeInTheDocument()
        expect(
            screen.getByText(/Are you sure you want to delete/),
        ).toBeInTheDocument()
        expect(screen.getByText('Test Business Hours')).toBeInTheDocument()
        expect(
            screen.getByText(/The custom schedule will be deleted/),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Delete' }),
        ).toBeInTheDocument()
    })

    it('calls setModalOpen with false when cancel button is clicked', () => {
        render(<DeleteModal {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        fireEvent.click(cancelButton)

        expect(defaultProps.setModalOpen).toHaveBeenCalledWith(false)
    })

    it('calls onDelete when delete button is clicked', () => {
        render(<DeleteModal {...defaultProps} />)

        const deleteButton = screen.getByRole('button', { name: 'Delete' })
        fireEvent.click(deleteButton)

        expect(defaultProps.onDelete).toHaveBeenCalled()
    })

    it('shows loading state on delete button when isDeleting is true', () => {
        render(<DeleteModal {...defaultProps} isDeleting={true} />)

        const deleteButton = screen.getByRole('button', {
            name: new RegExp('Delete'),
        })

        expect(deleteButton).toHaveAttribute('aria-disabled', 'true')
    })
})
