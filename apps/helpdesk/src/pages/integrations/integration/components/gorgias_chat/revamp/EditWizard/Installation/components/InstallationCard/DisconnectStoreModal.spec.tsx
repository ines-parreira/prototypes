import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DisconnectStoreModal } from './DisconnectStoreModal'

describe('DisconnectStoreModal', () => {
    const mockOnOpenChange = jest.fn()
    const mockOnDisconnect = jest.fn()

    const defaultProps = {
        isOpen: false,
        onOpenChange: mockOnOpenChange,
        onDisconnect: mockOnDisconnect,
        isDisconnectPending: false,
        isOneClickInstallation: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (props = {}) => {
        return render(<DisconnectStoreModal {...defaultProps} {...props} />)
    }

    describe('Modal', () => {
        it('should render modal content when open', () => {
            renderComponent({ isOpen: true })

            const dialog = screen.getByRole('dialog')
            expect(
                within(dialog).getByText('Disconnect store?'),
            ).toBeInTheDocument()
        })

        it('should not render modal content when closed', () => {
            renderComponent({ isOpen: false })

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    describe('OverlayContent', () => {
        it('should show one-click installation message when isOneClickInstallation is true', () => {
            renderComponent({ isOpen: true, isOneClickInstallation: true })

            expect(
                screen.getByText(
                    'Disconnecting this store will remove AI Agent features and uninstall the chat from your store, removing it from all pages.',
                ),
            ).toBeInTheDocument()
        })

        it('should show manual installation message when isOneClickInstallation is false', () => {
            renderComponent({ isOpen: true, isOneClickInstallation: false })

            expect(
                screen.getByText(
                    'Disconnecting this store will remove AI Agent features from your chat widget.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Cancel button', () => {
        it('should render cancel button', () => {
            renderComponent({ isOpen: true })

            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).toBeInTheDocument()
        })

        it('should enable cancel button when not disconnecting', () => {
            renderComponent({ isOpen: true, isDisconnectPending: false })

            expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
        })

        it('should disable cancel button when disconnecting', () => {
            renderComponent({ isOpen: true, isDisconnectPending: true })

            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).toBeDisabled()
        })

        it('should call onOpenChange with false when clicked', async () => {
            const user = userEvent.setup()
            renderComponent({ isOpen: true })

            await user.click(screen.getByRole('button', { name: 'Cancel' }))

            expect(mockOnOpenChange).toHaveBeenCalledWith(false)
        })
    })

    describe('Disconnect button', () => {
        it('should render disconnect button', () => {
            renderComponent({ isOpen: true })

            expect(
                screen.getByRole('button', { name: 'Disconnect' }),
            ).toBeInTheDocument()
        })

        it('should be clickable when not disconnecting', () => {
            renderComponent({ isOpen: true, isDisconnectPending: false })

            expect(
                screen.getByRole('button', { name: 'Disconnect' }),
            ).toBeEnabled()
        })

        it('should disable disconnect button when disconnecting', () => {
            renderComponent({ isOpen: true, isDisconnectPending: true })

            expect(
                screen.queryByRole('button', { name: 'Disconnect' }),
            ).not.toBeInTheDocument()
        })

        it('should call onDisconnect when clicked', async () => {
            const user = userEvent.setup()
            renderComponent({ isOpen: true })

            await user.click(screen.getByRole('button', { name: 'Disconnect' }))

            expect(mockOnDisconnect).toHaveBeenCalled()
        })
    })
})
