import React from 'react'

import { act, render, screen } from '@testing-library/react'
import user from '@testing-library/user-event'

import SendCampaignConfirmation from './SendCampaignConfirmation'

describe('SendCampaignConfirmation', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render modal when isOpen is true', () => {
        render(<SendCampaignConfirmation {...defaultProps} />)

        expect(screen.getByText('Send Campaign?')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
    })

    it('should not render modal when isOpen is false', () => {
        render(<SendCampaignConfirmation {...defaultProps} isOpen={false} />)

        expect(screen.queryByText('Send Campaign?')).not.toBeInTheDocument()
        expect(
            screen.queryByText(/You're about to send this campaign/),
        ).not.toBeInTheDocument()
    })

    it('should call onClose when Cancel button is clicked', async () => {
        render(<SendCampaignConfirmation {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        await act(async () => {
            await user.click(cancelButton)
        })

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onConfirm when Send button is clicked', async () => {
        render(<SendCampaignConfirmation {...defaultProps} />)

        const sendButton = screen.getByRole('button', { name: 'Send' })
        await act(async () => {
            await user.click(sendButton)
        })

        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose when Send button is clicked', async () => {
        render(<SendCampaignConfirmation {...defaultProps} />)

        const sendButton = screen.getByRole('button', { name: 'Send' })
        await act(async () => {
            await user.click(sendButton)
        })

        expect(defaultProps.onClose).not.toHaveBeenCalled()
        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onConfirm when Cancel button is clicked', async () => {
        render(<SendCampaignConfirmation {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        await act(async () => {
            await user.click(cancelButton)
        })

        expect(defaultProps.onConfirm).not.toHaveBeenCalled()
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
})
