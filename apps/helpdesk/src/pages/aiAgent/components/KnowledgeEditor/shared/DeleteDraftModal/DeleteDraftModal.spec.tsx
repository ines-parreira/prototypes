import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DeleteDraftModal } from './DeleteDraftModal'

const mockOnClose = jest.fn()
const mockOnDelete = jest.fn()

const defaultProps = {
    isOpen: true,
    isDeleting: false,
    onClose: mockOnClose,
    onDelete: mockOnDelete,
}

describe('DeleteDraftModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders modal with correct title when open', () => {
        render(<DeleteDraftModal {...defaultProps} />)

        expect(screen.getByText('Delete draft?')).toBeInTheDocument()
    })

    it('does not render modal when closed', () => {
        render(<DeleteDraftModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByText('Delete draft?')).not.toBeInTheDocument()
    })

    it('displays warning message about permanent deletion', () => {
        render(<DeleteDraftModal {...defaultProps} />)

        expect(
            screen.getByText(
                /Your draft will be permanently deleted, this content can't be restored./,
            ),
        ).toBeInTheDocument()
    })

    it('renders Back to editing button', () => {
        render(<DeleteDraftModal {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /Back to editing/i }),
        ).toBeInTheDocument()
    })

    it('renders Delete draft button', () => {
        render(<DeleteDraftModal {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /Delete draft/i }),
        ).toBeInTheDocument()
    })

    it('calls onClose when Back to editing button is clicked', async () => {
        const user = userEvent.setup()
        render(<DeleteDraftModal {...defaultProps} />)

        const backButton = screen.getByRole('button', {
            name: /Back to editing/i,
        })

        await act(() => user.click(backButton))

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnDelete).not.toHaveBeenCalled()
    })

    it('calls onDelete when Delete draft button is clicked', async () => {
        const user = userEvent.setup()
        render(<DeleteDraftModal {...defaultProps} />)

        const deleteButton = screen.getByRole('button', {
            name: /Delete draft/i,
        })

        await act(() => user.click(deleteButton))

        expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })

    it('disables Back to editing button while deleting', () => {
        render(<DeleteDraftModal {...defaultProps} isDeleting={true} />)

        const backButton = screen.getByRole('button', {
            name: /Back to editing/i,
        })

        expect(backButton).toBeDisabled()
    })

    it('disables Delete draft button while deleting', () => {
        render(<DeleteDraftModal {...defaultProps} isDeleting={true} />)

        const deleteButton = screen.getByRole('button', {
            name: /Delete draft/i,
        })

        expect(deleteButton).toBeDisabled()
    })
})
