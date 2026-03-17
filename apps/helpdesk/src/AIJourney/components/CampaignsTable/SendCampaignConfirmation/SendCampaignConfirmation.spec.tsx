import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SendCampaignConfirmation from './SendCampaignConfirmation'

describe('SendCampaignConfirmation', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        hasIncludedAudiences: true,
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
        const user = userEvent.setup()
        render(<SendCampaignConfirmation {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        await user.click(cancelButton)

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onConfirm when Send button is clicked', async () => {
        const user = userEvent.setup()
        render(<SendCampaignConfirmation {...defaultProps} />)

        const sendButton = screen.getByRole('button', { name: 'Send' })
        await user.click(sendButton)

        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose when Send button is clicked', async () => {
        const user = userEvent.setup()
        render(<SendCampaignConfirmation {...defaultProps} />)

        const sendButton = screen.getByRole('button', { name: 'Send' })
        await user.click(sendButton)

        expect(defaultProps.onClose).not.toHaveBeenCalled()
        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onConfirm when Cancel button is clicked', async () => {
        const user = userEvent.setup()
        render(<SendCampaignConfirmation {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        await user.click(cancelButton)

        expect(defaultProps.onConfirm).not.toHaveBeenCalled()
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    describe('when campaign has no included audiences', () => {
        it('should show "Cannot Send Campaign" title and no Send button', () => {
            render(
                <SendCampaignConfirmation
                    {...defaultProps}
                    hasIncludedAudiences={false}
                />,
            )

            expect(screen.getByText('Cannot Send Campaign')).toBeInTheDocument()
            expect(screen.getByText(/no audience attached/)).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Send' }),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Close' }),
            ).toBeInTheDocument()
        })

        it('should call onClose when Close button is clicked', async () => {
            const user = userEvent.setup()
            render(
                <SendCampaignConfirmation
                    {...defaultProps}
                    hasIncludedAudiences={false}
                />,
            )

            const closeButton = screen.getByRole('button', { name: 'Close' })
            await user.click(closeButton)

            expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
        })
    })

    describe('when campaign has included audiences', () => {
        it('should show "Send Campaign?" title with Send and Cancel buttons', () => {
            render(
                <SendCampaignConfirmation
                    {...defaultProps}
                    hasIncludedAudiences={true}
                />,
            )

            expect(screen.getByText('Send Campaign?')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Send' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).toBeInTheDocument()
        })
    })
})
