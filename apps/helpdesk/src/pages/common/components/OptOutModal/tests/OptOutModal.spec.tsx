import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OptOutModal } from '../OptOutModal'

const DEFAULT_PROPS = {
    title: 'Test Modal Title',
    isLoading: false,
    isOpen: true,
    onOptOut: jest.fn(),
    onClose: jest.fn(),
    onDismiss: jest.fn(),
}

describe('OptOutModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when modal is open', () => {
        it('should render with title and children', () => {
            render(
                <OptOutModal {...DEFAULT_PROPS}>
                    <OptOutModal.Body>Test body content</OptOutModal.Body>
                    <OptOutModal.Actions>
                        <OptOutModal.SecondaryAction>
                            Cancel
                        </OptOutModal.SecondaryAction>
                        <OptOutModal.DestructiveAction>
                            Confirm
                        </OptOutModal.DestructiveAction>
                    </OptOutModal.Actions>
                </OptOutModal>,
            )

            expect(screen.getByText('Test Modal Title')).toBeInTheDocument()
            expect(screen.getByText('Test body content')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Confirm' }),
            ).toBeInTheDocument()
        })

        it('should call onClose when modal is closed', async () => {
            const user = userEvent.setup()
            const onCloseMock = jest.fn()

            render(
                <OptOutModal {...DEFAULT_PROPS} onClose={onCloseMock}>
                    <OptOutModal.Body>Test content</OptOutModal.Body>
                </OptOutModal>,
            )

            const closeButton = screen.getByRole('button', { name: '' })
            await user.click(closeButton)

            expect(onCloseMock).toHaveBeenCalledTimes(1)
        })
    })

    describe('when modal is closed', () => {
        it('should not render when isOpen is false', () => {
            render(
                <OptOutModal {...DEFAULT_PROPS} isOpen={false}>
                    <OptOutModal.Body>Test content</OptOutModal.Body>
                </OptOutModal>,
            )

            expect(
                screen.queryByText('Test Modal Title'),
            ).not.toBeInTheDocument()
            expect(screen.queryByText('Test content')).not.toBeInTheDocument()
        })
    })

    describe('OptOutModal.Body', () => {
        it('should render children content', () => {
            render(
                <OptOutModal {...DEFAULT_PROPS}>
                    <OptOutModal.Body>
                        <div>Custom body content</div>
                        <p>Additional paragraph</p>
                    </OptOutModal.Body>
                </OptOutModal>,
            )

            expect(screen.getByText('Custom body content')).toBeInTheDocument()
            expect(screen.getByText('Additional paragraph')).toBeInTheDocument()
        })

        it('should render without children', () => {
            render(
                <OptOutModal {...DEFAULT_PROPS}>
                    <OptOutModal.Body />
                </OptOutModal>,
            )

            expect(screen.getByText('Test Modal Title')).toBeInTheDocument()
        })
    })

    describe('OptOutModal.Actions', () => {
        it('should render children components', () => {
            render(
                <OptOutModal {...DEFAULT_PROPS}>
                    <OptOutModal.Actions>
                        <OptOutModal.SecondaryAction>
                            Secondary Action
                        </OptOutModal.SecondaryAction>
                        <OptOutModal.DestructiveAction>
                            Destructive Action
                        </OptOutModal.DestructiveAction>
                    </OptOutModal.Actions>
                </OptOutModal>,
            )

            expect(
                screen.getByRole('button', { name: 'Secondary Action' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Destructive Action' }),
            ).toBeInTheDocument()
        })
    })

    describe('OptOutModal.SecondaryAction', () => {
        it('should call onDismiss when clicked', async () => {
            const user = userEvent.setup()
            const onDismissMock = jest.fn()

            render(
                <OptOutModal {...DEFAULT_PROPS} onDismiss={onDismissMock}>
                    <OptOutModal.Actions>
                        <OptOutModal.SecondaryAction>
                            Cancel Action
                        </OptOutModal.SecondaryAction>
                    </OptOutModal.Actions>
                </OptOutModal>,
            )

            const secondaryButton = screen.getByRole('button', {
                name: 'Cancel Action',
            })
            await user.click(secondaryButton)

            expect(onDismissMock).toHaveBeenCalledTimes(1)
        })

        it('should render with correct styling attributes', () => {
            render(
                <OptOutModal {...DEFAULT_PROPS}>
                    <OptOutModal.Actions>
                        <OptOutModal.SecondaryAction>
                            Secondary
                        </OptOutModal.SecondaryAction>
                    </OptOutModal.Actions>
                </OptOutModal>,
            )

            const button = screen.getByRole('button', { name: 'Secondary' })
            expect(button).toHaveClass('ui-button-ghost-cef1')
            expect(button).toHaveClass('ui-button-secondary-cef1')
        })
    })

    describe('OptOutModal.DestructiveAction', () => {
        it('should call onOptOut when clicked', async () => {
            const user = userEvent.setup()
            const onOptOutMock = jest.fn()

            render(
                <OptOutModal {...DEFAULT_PROPS} onOptOut={onOptOutMock}>
                    <OptOutModal.Actions>
                        <OptOutModal.DestructiveAction>
                            Destructive Action
                        </OptOutModal.DestructiveAction>
                    </OptOutModal.Actions>
                </OptOutModal>,
            )

            const destructiveButton = screen.getByRole('button', {
                name: 'Destructive Action',
            })
            await user.click(destructiveButton)

            expect(onOptOutMock).toHaveBeenCalledTimes(1)
        })

        it('should show loading state when isLoading is true', () => {
            render(
                <OptOutModal {...DEFAULT_PROPS} isLoading={true}>
                    <OptOutModal.Actions>
                        <OptOutModal.DestructiveAction>
                            Loading Action
                        </OptOutModal.DestructiveAction>
                    </OptOutModal.Actions>
                </OptOutModal>,
            )

            const button = screen.getByRole('button', {
                name: 'Loading... Loading Action',
            })
            expect(button).toHaveAttribute('aria-disabled', 'true')
        })

        it('should render with correct styling attributes', () => {
            render(
                <OptOutModal {...DEFAULT_PROPS}>
                    <OptOutModal.Actions>
                        <OptOutModal.DestructiveAction>
                            Destructive
                        </OptOutModal.DestructiveAction>
                    </OptOutModal.Actions>
                </OptOutModal>,
            )

            const button = screen.getByRole('button', { name: 'Destructive' })
            expect(button).toHaveClass('ui-button-destructive-cef1')
        })
    })

    describe('when compound components are used outside OptOutModal', () => {
        it('should render Body without provider (does not use context)', () => {
            render(<OptOutModal.Body>Test</OptOutModal.Body>)
            expect(screen.getByText('Test')).toBeInTheDocument()
        })

        it('should render Actions without provider (does not use context)', () => {
            render(<OptOutModal.Actions>Test</OptOutModal.Actions>)
            expect(screen.getByText('Test')).toBeInTheDocument()
        })

        it('should throw error when SecondaryAction is used without provider', () => {
            expect(() => {
                render(
                    <OptOutModal.SecondaryAction>
                        Test
                    </OptOutModal.SecondaryAction>,
                )
            }).toThrow(
                'OptOutModal compound components must be used within OptOutModal',
            )
        })

        it('should throw error when DestructiveAction is used without provider', () => {
            expect(() => {
                render(
                    <OptOutModal.DestructiveAction>
                        Test
                    </OptOutModal.DestructiveAction>,
                )
            }).toThrow(
                'OptOutModal compound components must be used within OptOutModal',
            )
        })
    })

    describe('when multiple actions are used together', () => {
        it('should handle both secondary and destructive actions correctly', async () => {
            const user = userEvent.setup()
            const onDismissMock = jest.fn()
            const onOptOutMock = jest.fn()

            render(
                <OptOutModal
                    {...DEFAULT_PROPS}
                    onDismiss={onDismissMock}
                    onOptOut={onOptOutMock}
                >
                    <OptOutModal.Body>Are you sure?</OptOutModal.Body>
                    <OptOutModal.Actions>
                        <OptOutModal.SecondaryAction>
                            Keep Trial
                        </OptOutModal.SecondaryAction>
                        <OptOutModal.DestructiveAction>
                            Opt Out
                        </OptOutModal.DestructiveAction>
                    </OptOutModal.Actions>
                </OptOutModal>,
            )

            expect(screen.getByText('Are you sure?')).toBeInTheDocument()

            const keepButton = screen.getByRole('button', {
                name: 'Keep Trial',
            })
            const optOutButton = screen.getByRole('button', { name: 'Opt Out' })

            await user.click(keepButton)
            expect(onDismissMock).toHaveBeenCalledTimes(1)
            expect(onOptOutMock).not.toHaveBeenCalled()

            jest.clearAllMocks()

            await user.click(optOutButton)
            expect(onOptOutMock).toHaveBeenCalledTimes(1)
            expect(onDismissMock).not.toHaveBeenCalled()
        })
    })
})
