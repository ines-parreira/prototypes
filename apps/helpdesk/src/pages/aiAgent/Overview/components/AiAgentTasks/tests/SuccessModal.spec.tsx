import React from 'react'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { SuccessModal } from '../../AiAgentTasks/SuccessModal'

describe('SuccessModal', () => {
    it('renders the modal with title, description, and action button when isOpen is true', async () => {
        const user = userEvent.setup()
        const handleOnClose = jest.fn()

        render(
            <SuccessModal
                isOpen={true}
                title="Success!"
                description="Your changes have been saved successfully."
                actionLabel="Got it"
                handleOnClose={handleOnClose}
            />,
        )

        expect(
            screen.getByRole('heading', { name: 'Success!' }),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Your changes have been saved successfully.'),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Got it' }),
        ).toBeInTheDocument()
        expect(
            screen.getByAltText('Confirmation for successful action'),
        ).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Got it' }))
        expect(handleOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not render the modal when isOpen is false', () => {
        const handleOnClose = jest.fn()

        render(
            <SuccessModal
                isOpen={false}
                title="Success!"
                description="Your changes have been saved."
                actionLabel="Got it"
                handleOnClose={handleOnClose}
            />,
        )

        expect(
            screen.queryByRole('heading', { name: 'Success!' }),
        ).not.toBeInTheDocument()
    })

    it('calls handleOnClose when close icon button is clicked', async () => {
        const user = userEvent.setup()
        const handleOnClose = jest.fn()

        render(
            <SuccessModal
                isOpen={true}
                title="Success!"
                description="Your changes have been saved."
                actionLabel="Continue"
                handleOnClose={handleOnClose}
            />,
        )

        const closeButton = screen.getByRole('button', { name: /close/i })
        await user.click(closeButton)

        expect(handleOnClose).toHaveBeenCalledTimes(1)
    })

    it('renders React node as description', () => {
        const handleOnClose = jest.fn()
        const description = (
            <div>
                <strong>Important:</strong> Please review your settings.
            </div>
        )

        render(
            <SuccessModal
                isOpen={true}
                title="Configuration Updated"
                description={description}
                actionLabel="Review"
                handleOnClose={handleOnClose}
            />,
        )

        expect(screen.getByText('Important:')).toBeInTheDocument()
        expect(
            screen.getByText('Please review your settings.'),
        ).toBeInTheDocument()
    })
})
