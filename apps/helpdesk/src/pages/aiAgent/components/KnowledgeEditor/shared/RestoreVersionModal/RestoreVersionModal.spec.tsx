import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RestoreVersionModal } from './RestoreVersionModal'

describe('RestoreVersionModal', () => {
    const defaultProps = {
        isOpen: true,
        isRestoring: false,
        onClose: jest.fn(),
        onRestore: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the modal when isOpen is true', () => {
        render(<RestoreVersionModal {...defaultProps} />)

        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('does not render the modal when isOpen is false', () => {
        render(<RestoreVersionModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('displays the correct title', () => {
        render(<RestoreVersionModal {...defaultProps} />)

        expect(
            screen.getByRole('heading', { name: 'Restore this version?' }),
        ).toBeInTheDocument()
    })

    it('displays the warning text about creating a new draft', () => {
        render(<RestoreVersionModal {...defaultProps} />)

        expect(
            screen.getByText(
                'This will create a new draft from this version. Any existing draft edits will be deleted and this cannot be undone.',
            ),
        ).toBeInTheDocument()
    })

    it('renders Cancel and Restore as draft buttons', () => {
        render(<RestoreVersionModal {...defaultProps} />)

        const modal = screen.getByRole('dialog')
        expect(
            within(modal).getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            within(modal).getByRole('button', { name: 'Restore as draft' }),
        ).toBeInTheDocument()
    })

    it('calls onClose when Cancel button is clicked', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()
        render(<RestoreVersionModal {...defaultProps} onClose={onClose} />)

        const modal = screen.getByRole('dialog')
        await user.click(within(modal).getByRole('button', { name: 'Cancel' }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onRestore when Restore as draft button is clicked', async () => {
        const user = userEvent.setup()
        const onRestore = jest.fn()
        render(<RestoreVersionModal {...defaultProps} onRestore={onRestore} />)

        const modal = screen.getByRole('dialog')
        await user.click(
            within(modal).getByRole('button', { name: 'Restore as draft' }),
        )

        expect(onRestore).toHaveBeenCalledTimes(1)
    })

    it('disables Cancel button when isRestoring is true', () => {
        render(<RestoreVersionModal {...defaultProps} isRestoring={true} />)

        const modal = screen.getByRole('dialog')
        expect(
            within(modal).getByRole('button', { name: 'Cancel' }),
        ).toBeDisabled()
    })

    it('shows loading state on Restore as draft button when isRestoring is true', () => {
        render(<RestoreVersionModal {...defaultProps} isRestoring={true} />)

        const modal = screen.getByRole('dialog')
        const restoreButton = within(modal).getByRole('button', {
            name: /Restore as draft/,
        })

        expect(restoreButton).toHaveAttribute('data-pending', 'true')
    })
})
