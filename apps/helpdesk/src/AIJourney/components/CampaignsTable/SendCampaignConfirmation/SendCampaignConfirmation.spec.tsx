import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
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

        expect(screen.getByText('Send campaign now?')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Go back' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Send now' }),
        ).toBeInTheDocument()
    })

    it('should not render modal when isOpen is false', () => {
        render(<SendCampaignConfirmation {...defaultProps} isOpen={false} />)

        expect(screen.queryByText('Send campaign now?')).not.toBeInTheDocument()
        expect(
            screen.queryByText(
                /This campaign will be sent to your audience immediately/,
            ),
        ).not.toBeInTheDocument()
    })

    it('should call onClose when Cancel button is clicked', async () => {
        const user = userEvent.setup()
        render(<SendCampaignConfirmation {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: 'Go back' })
        await user.click(cancelButton)

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onConfirm when Send now button is clicked', async () => {
        const user = userEvent.setup()
        render(<SendCampaignConfirmation {...defaultProps} />)

        const sendButton = screen.getByRole('button', { name: 'Send now' })
        await user.click(sendButton)

        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose when Send now button is clicked', async () => {
        const user = userEvent.setup()
        render(<SendCampaignConfirmation {...defaultProps} />)

        const sendButton = screen.getByRole('button', { name: 'Send now' })
        await user.click(sendButton)

        expect(defaultProps.onClose).not.toHaveBeenCalled()
        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onConfirm when Go back button is clicked', async () => {
        const user = userEvent.setup()
        render(<SendCampaignConfirmation {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: 'Go back' })
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
                screen.queryByRole('button', { name: 'Send now' }),
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
        it('should show "Send campaign now?" title with Send now and Go back buttons', () => {
            render(
                <SendCampaignConfirmation
                    {...defaultProps}
                    hasIncludedAudiences={true}
                />,
            )

            expect(screen.getByText('Send campaign now?')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Send now' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Go back' }),
            ).toBeInTheDocument()
        })
    })
})
