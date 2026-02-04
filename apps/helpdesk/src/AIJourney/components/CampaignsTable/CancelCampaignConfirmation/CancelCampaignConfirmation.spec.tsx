import React from 'react'

import { act, render, screen } from '@testing-library/react'
import user from '@testing-library/user-event'

import CancelCampaignConfirmation from './CancelCampaignConfirmation'

describe('CancelCampaignConfirmation', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render modal when isOpen is true', () => {
        render(<CancelCampaignConfirmation {...defaultProps} />)

        expect(screen.getByText('Cancel Campaign?')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Go back' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel Campaign' }),
        ).toBeInTheDocument()
    })

    it('should not render modal when isOpen is false', () => {
        render(<CancelCampaignConfirmation {...defaultProps} isOpen={false} />)

        expect(screen.queryByText('Cancel Campaign?')).not.toBeInTheDocument()
        expect(
            screen.queryByText(/You're about to cancel this campaign/),
        ).not.toBeInTheDocument()
    })

    it('should call onClose when Go back button is clicked', async () => {
        render(<CancelCampaignConfirmation {...defaultProps} />)

        const cancelButton = screen.getByRole('button', {
            name: 'Go back',
        })
        await act(async () => {
            await user.click(cancelButton)
        })

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onConfirm when Cancel button is clicked', async () => {
        render(<CancelCampaignConfirmation {...defaultProps} />)

        const cancelButton = screen.getByRole('button', {
            name: 'Cancel Campaign',
        })
        await act(async () => {
            await user.click(cancelButton)
        })

        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })
})
