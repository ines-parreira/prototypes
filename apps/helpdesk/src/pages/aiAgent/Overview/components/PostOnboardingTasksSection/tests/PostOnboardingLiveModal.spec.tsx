import React from 'react'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { PostOnboardingLiveModal } from '../PostOnboardingLiveModal'

jest.mock('pages/common/components/modal/Modal', () => ({
    __esModule: true,
    default: ({ children, isOpen, onClose }: any) =>
        isOpen ? (
            <div data-testid="modal">
                <button data-testid="modal-close" onClick={onClose}>
                    Close Modal
                </button>
                {children}
            </div>
        ) : null,
}))

jest.mock('pages/common/components/modal/ModalBody', () => ({
    __esModule: true,
    default: ({ children, className }: any) => (
        <div data-testid="modal-body" className={className}>
            {children}
        </div>
    ),
}))

jest.mock('pages/common/components/modal/ModalFooter', () => ({
    __esModule: true,
    default: ({ children, className }: any) => (
        <div data-testid="modal-footer" className={className}>
            {children}
        </div>
    ),
}))

describe('PostOnboardingLiveModal', () => {
    const defaultProps = {
        isOpen: true,
        channel: 'email' as const,
        handleOnClose: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the modal when isOpen is true', () => {
        render(<PostOnboardingLiveModal {...defaultProps} />)

        expect(screen.getByTestId('modal')).toBeInTheDocument()
        expect(screen.getByAltText('AI Agent is live')).toBeInTheDocument()
        expect(
            screen.getByText('AI Agent is now live on your email!'),
        ).toBeInTheDocument()
        expect(screen.getByText('Got it')).toBeInTheDocument()
    })

    it('does not render the modal when isOpen is false', () => {
        render(<PostOnboardingLiveModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('calls handleOnClose when close button is clicked', async () => {
        const handleOnClose = jest.fn()

        render(
            <PostOnboardingLiveModal
                {...defaultProps}
                handleOnClose={handleOnClose}
            />,
        )

        const closeButton = screen.getByTestId('modal-close')
        await userEvent.click(closeButton)

        expect(handleOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls handleOnClose when "Got it" button is clicked', async () => {
        const handleOnClose = jest.fn()

        render(
            <PostOnboardingLiveModal
                {...defaultProps}
                handleOnClose={handleOnClose}
            />,
        )

        const gotItButton = screen.getByText('Got it')
        await userEvent.click(gotItButton)

        expect(handleOnClose).toHaveBeenCalledTimes(1)
    })

    it('displays correct content for chat channel', () => {
        render(<PostOnboardingLiveModal {...defaultProps} channel="chat" />)

        expect(
            screen.getByText('AI Agent is now live on your chat!'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/automatically answer customer questions/),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/on chat, freeing up your team/),
        ).toBeInTheDocument()
    })
})
