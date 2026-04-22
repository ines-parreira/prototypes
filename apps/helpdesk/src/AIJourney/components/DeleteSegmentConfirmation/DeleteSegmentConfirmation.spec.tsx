import React from 'react'

import { act, render, screen } from '@testing-library/react'
import user from '@testing-library/user-event'

import { DeleteSegmentConfirmation } from './DeleteSegmentConfirmation'

describe('DeleteSegmentConfirmation', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the modal content when isOpen is true', () => {
        render(<DeleteSegmentConfirmation {...defaultProps} />)

        expect(screen.getByText('Delete segment?')).toBeInTheDocument()
        expect(
            screen.getByText(/This segment will be permanently removed/),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Delete segment' }),
        ).toBeInTheDocument()
    })

    it('should not render the modal content when isOpen is false', () => {
        render(<DeleteSegmentConfirmation {...defaultProps} isOpen={false} />)

        expect(screen.queryByText('Delete segment?')).not.toBeInTheDocument()
        expect(
            screen.queryByText(/This segment will be permanently removed/),
        ).not.toBeInTheDocument()
    })

    it('should call onClose when the Cancel button is clicked', async () => {
        render(<DeleteSegmentConfirmation {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        await act(async () => {
            await user.click(cancelButton)
        })

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onConfirm when the Delete segment button is clicked', async () => {
        render(<DeleteSegmentConfirmation {...defaultProps} />)

        const deleteButton = screen.getByRole('button', {
            name: 'Delete segment',
        })
        await act(async () => {
            await user.click(deleteButton)
        })

        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })
})
