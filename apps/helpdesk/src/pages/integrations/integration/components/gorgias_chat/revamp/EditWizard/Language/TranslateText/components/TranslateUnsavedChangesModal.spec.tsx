import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TranslateUnsavedChangesModal } from './TranslateUnsavedChangesModal'

const defaultProps = {
    isOpen: true,
    description: 'Do you want to save your changes?',
    onSave: jest.fn(),
    onDiscard: jest.fn(),
    onClose: jest.fn(),
}

describe('TranslateUnsavedChangesModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('visibility', () => {
        it('should not render when isOpen is false', () => {
            render(
                <TranslateUnsavedChangesModal
                    {...defaultProps}
                    isOpen={false}
                />,
            )

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('should render when isOpen is true', () => {
            render(<TranslateUnsavedChangesModal {...defaultProps} />)

            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })
    })

    describe('content', () => {
        it('should display the unsaved changes title', () => {
            render(<TranslateUnsavedChangesModal {...defaultProps} />)

            expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
        })

        it('should display the provided description', () => {
            render(
                <TranslateUnsavedChangesModal
                    {...defaultProps}
                    description="Do you want to save your changes before leaving?"
                />,
            )

            expect(
                screen.getByText(/save your changes before leaving/i),
            ).toBeInTheDocument()
        })

        it('should display a different description for language switch', () => {
            render(
                <TranslateUnsavedChangesModal
                    {...defaultProps}
                    description="Do you want to save your changes before switching language?"
                />,
            )

            expect(
                screen.getByText(
                    /save your changes before switching language/i,
                ),
            ).toBeInTheDocument()
        })
    })

    describe('actions', () => {
        it('should call onSave when Save changes is clicked', async () => {
            const user = userEvent.setup()
            const onSave = jest.fn()

            render(
                <TranslateUnsavedChangesModal
                    {...defaultProps}
                    onSave={onSave}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /save changes/i }),
            )

            expect(onSave).toHaveBeenCalledTimes(1)
        })

        it('should call onDiscard when Discard changes is clicked', async () => {
            const user = userEvent.setup()
            const onDiscard = jest.fn()

            render(
                <TranslateUnsavedChangesModal
                    {...defaultProps}
                    onDiscard={onDiscard}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /discard changes/i }),
            )

            expect(onDiscard).toHaveBeenCalledTimes(1)
        })

        it('should call onClose when the modal is dismissed', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()

            render(
                <TranslateUnsavedChangesModal
                    {...defaultProps}
                    onClose={onClose}
                />,
            )

            await user.keyboard('{Escape}')

            expect(onClose).toHaveBeenCalledTimes(1)
        })
    })
})
