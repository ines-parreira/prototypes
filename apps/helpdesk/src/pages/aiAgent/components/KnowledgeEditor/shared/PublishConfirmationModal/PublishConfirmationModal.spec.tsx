import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PublishConfirmationModal } from './PublishConfirmationModal'

describe('PublishConfirmationModal', () => {
    const defaultProps = {
        isOpen: true,
        isPublishing: false,
        onClose: jest.fn(),
        onPublish: jest.fn().mockResolvedValue(undefined),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the modal when isOpen is true', () => {
        render(<PublishConfirmationModal {...defaultProps} />)

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(
            screen.getByRole('heading', { name: 'Publish changes' }),
        ).toBeInTheDocument()
    })

    it('does not render the modal when isOpen is false', () => {
        render(<PublishConfirmationModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders the commit message text field', () => {
        render(<PublishConfirmationModal {...defaultProps} />)

        const textField = screen.getByLabelText(/change summary \(optional\)/i)
        expect(textField).toBeInTheDocument()
        expect(textField).toHaveAttribute(
            'placeholder',
            'Updated return window from 15 to 30 days',
        )
    })

    it('renders Cancel and Publish buttons', () => {
        render(<PublishConfirmationModal {...defaultProps} />)

        const modal = screen.getByRole('dialog')
        expect(
            within(modal).getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            within(modal).getByRole('button', { name: 'Publish' }),
        ).toBeInTheDocument()
    })

    it('calls onPublish with empty string when clicking Publish without entering a message', async () => {
        const user = userEvent.setup()
        const onPublish = jest.fn().mockResolvedValue(undefined)
        render(
            <PublishConfirmationModal
                {...defaultProps}
                onPublish={onPublish}
            />,
        )

        const modal = screen.getByRole('dialog')
        await user.click(within(modal).getByRole('button', { name: 'Publish' }))

        expect(onPublish).toHaveBeenCalledWith('')
    })

    it('calls onPublish with commit message when clicking Publish', async () => {
        const user = userEvent.setup()
        const onPublish = jest.fn().mockResolvedValue(undefined)
        render(
            <PublishConfirmationModal
                {...defaultProps}
                onPublish={onPublish}
            />,
        )

        const textField = screen.getByLabelText(/change summary \(optional\)/i)
        await user.type(textField, 'Fixed typo in description')
        await user.click(screen.getByRole('button', { name: 'Publish' }))

        expect(onPublish).toHaveBeenCalledWith('Fixed typo in description')
    })

    it('calls onClose when clicking Cancel', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()
        render(<PublishConfirmationModal {...defaultProps} onClose={onClose} />)

        const modal = screen.getByRole('dialog')
        await user.click(within(modal).getByRole('button', { name: 'Cancel' }))

        expect(onClose).toHaveBeenCalled()
    })

    it('calls onPublish when pressing Enter in the text field', async () => {
        const user = userEvent.setup()
        const onPublish = jest.fn().mockResolvedValue(undefined)
        render(
            <PublishConfirmationModal
                {...defaultProps}
                onPublish={onPublish}
            />,
        )

        const textField = screen.getByLabelText(/change summary \(optional\)/i)
        await user.type(textField, 'Updated content{Enter}')

        expect(onPublish).toHaveBeenCalledWith('Updated content')
    })

    it('disables buttons when isPublishing is true', () => {
        render(
            <PublishConfirmationModal {...defaultProps} isPublishing={true} />,
        )

        const modal = screen.getByRole('dialog')
        expect(
            within(modal).getByRole('button', { name: 'Cancel' }),
        ).toBeDisabled()
    })

    it('does not call onPublish when pressing Enter while isPublishing is true', async () => {
        const user = userEvent.setup()
        const onPublish = jest.fn().mockResolvedValue(undefined)
        render(
            <PublishConfirmationModal
                {...defaultProps}
                isPublishing={true}
                onPublish={onPublish}
            />,
        )

        const textField = screen.getByLabelText(/change summary \(optional\)/i)
        await user.type(textField, 'Test{Enter}')

        expect(onPublish).not.toHaveBeenCalled()
    })

    it('clears the commit message after publish', async () => {
        const user = userEvent.setup()
        const onPublish = jest.fn().mockResolvedValue(undefined)
        render(
            <PublishConfirmationModal
                {...defaultProps}
                onPublish={onPublish}
            />,
        )

        const textField = screen.getByLabelText(/change summary \(optional\)/i)
        await user.type(textField, 'Some message')
        await user.click(screen.getByRole('button', { name: 'Publish' }))

        expect(textField).toHaveValue('')
    })

    it('clears the commit message when closing the modal', async () => {
        const user = userEvent.setup()
        render(<PublishConfirmationModal {...defaultProps} />)

        const textField = screen.getByLabelText(/change summary \(optional\)/i)
        await user.type(textField, 'Some message')

        const modal = screen.getByRole('dialog')
        await user.click(within(modal).getByRole('button', { name: 'Cancel' }))

        expect(textField).toHaveValue('')
    })

    it('trims whitespace from commit message before publishing', async () => {
        const user = userEvent.setup()
        const onPublish = jest.fn().mockResolvedValue(undefined)
        render(
            <PublishConfirmationModal
                {...defaultProps}
                onPublish={onPublish}
            />,
        )

        const textField = screen.getByLabelText(/change summary \(optional\)/i)
        await user.type(textField, '  Fixed typo  ')
        await user.click(screen.getByRole('button', { name: 'Publish' }))

        expect(onPublish).toHaveBeenCalledWith('Fixed typo')
    })

    it('trims commit message with only whitespace to empty string', async () => {
        const user = userEvent.setup()
        const onPublish = jest.fn().mockResolvedValue(undefined)
        render(
            <PublishConfirmationModal
                {...defaultProps}
                onPublish={onPublish}
            />,
        )

        const textField = screen.getByLabelText(/change summary \(optional\)/i)
        await user.type(textField, '    ')
        await user.click(screen.getByRole('button', { name: 'Publish' }))

        expect(onPublish).toHaveBeenCalledWith('')
    })
})
