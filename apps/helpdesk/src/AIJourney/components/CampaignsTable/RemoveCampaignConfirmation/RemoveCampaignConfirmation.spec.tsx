import React from 'react'

import { act, render, screen } from '@testing-library/react'
import user from '@testing-library/user-event'

import RemoveCampaignConfirmation from './RemoveCampaignConfirmation'

describe('RemoveMetafieldConfirmation', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render modal when isOpen is true', () => {
        render(<RemoveCampaignConfirmation {...defaultProps} />)

        expect(screen.getByText('Delete Campaign?')).toBeInTheDocument()
        expect(
            screen.getByText(/You’re about to delete this campaign/),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Delete' }),
        ).toBeInTheDocument()
    })

    it('should not render modal when isOpen is false', () => {
        render(<RemoveCampaignConfirmation {...defaultProps} isOpen={false} />)

        expect(screen.queryByText('Delete Campaign?')).not.toBeInTheDocument()
        expect(
            screen.queryByText(/You’re about to delete this campaign/),
        ).not.toBeInTheDocument()
    })

    it('should call onClose when Cancel button is clicked', async () => {
        render(<RemoveCampaignConfirmation {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        await act(async () => {
            await user.click(cancelButton)
        })

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call both onConfirm when Delete button is clicked', async () => {
        render(<RemoveCampaignConfirmation {...defaultProps} />)

        const removeButton = screen.getByRole('button', { name: 'Delete' })
        await act(async () => {
            await user.click(removeButton)
        })

        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })
})
