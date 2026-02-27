import { render } from '@testing-library/react'

import {
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    ModalSize,
} from '@gorgias/axiom'

import DisconnectStoreModal from './DisconnectStoreModal'

const mockModal = jest.fn(({ children }: any) => children)
const mockOverlayHeader = jest.fn((__props: any) => null)
const mockOverlayContent = jest.fn(({ children }: any) => children)
const mockOverlayFooter = jest.fn(({ children }: any) => children)
const mockButton = jest.fn((__props: any) => null)
const mockText = jest.fn(({ children }: any) => children)

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Modal: (props: any) => mockModal(props),
    OverlayHeader: (props: any) => mockOverlayHeader(props),
    OverlayContent: (props: any) => mockOverlayContent(props),
    OverlayFooter: (props: any) => mockOverlayFooter(props),
    Button: (props: any) => mockButton(props),
    Text: (props: any) => mockText(props),
}))

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
        it('should render modal with correct props', () => {
            renderComponent({ isOpen: true })

            expect(mockModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    size: ModalSize.Md,
                    isOpen: true,
                    onOpenChange: mockOnOpenChange,
                }),
            )
        })

        it('should pass isOpen false when modal is closed', () => {
            renderComponent({ isOpen: false })

            expect(mockModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOpen: false,
                }),
            )
        })
    })

    describe('OverlayHeader', () => {
        it('should render header with correct title', () => {
            renderComponent()

            expect(mockOverlayHeader).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Disconnect store?',
                }),
            )
        })
    })

    describe('OverlayContent', () => {
        it('should show one-click installation message when isOneClickInstallation is true', () => {
            renderComponent({ isOneClickInstallation: true })

            const textCalls = mockText.mock.calls as any[]
            const contentText = textCalls[0]

            expect(contentText[0].children).toBe(
                'Disconnecting this store will remove AI Agent features and uninstall the chat from your store, removing it from all pages.',
            )
        })

        it('should show manual installation message when isOneClickInstallation is false', () => {
            renderComponent({ isOneClickInstallation: false })

            const textCalls = mockText.mock.calls as any[]
            const contentText = textCalls[0]

            expect(contentText[0].children).toBe(
                'Disconnecting this store will remove AI Agent features from your chat widget.',
            )
        })
    })

    describe('OverlayFooter', () => {
        it('should hide cancel button in footer', () => {
            renderComponent()

            expect(mockOverlayFooter).toHaveBeenCalledWith(
                expect.objectContaining({
                    hideCancelButton: true,
                }),
            )
        })
    })

    describe('Cancel button', () => {
        it('should render cancel button with correct props', () => {
            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            const cancelButton = buttonCalls.find(
                (call) => call[0].children === 'Cancel',
            )

            expect(cancelButton).toBeDefined()
            expect(cancelButton[0].intent).toBe(ButtonIntent.Regular)
            expect(cancelButton[0].size).toBe(ButtonSize.Md)
            expect(cancelButton[0].variant).toBe(ButtonVariant.Secondary)
        })

        it('should enable cancel button when not disconnecting', () => {
            renderComponent({ isDisconnectPending: false })

            const buttonCalls = mockButton.mock.calls as any[]
            const cancelButton = buttonCalls.find(
                (call) => call[0].children === 'Cancel',
            )

            expect(cancelButton[0].isDisabled).toBe(false)
        })

        it('should disable cancel button when disconnecting', () => {
            renderComponent({ isDisconnectPending: true })

            const buttonCalls = mockButton.mock.calls as any[]
            const cancelButton = buttonCalls.find(
                (call) => call[0].children === 'Cancel',
            )

            expect(cancelButton[0].isDisabled).toBe(true)
        })

        it('should call onOpenChange with false when clicked', () => {
            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            const cancelButton = buttonCalls.find(
                (call) => call[0].children === 'Cancel',
            )

            cancelButton[0].onClick()

            expect(mockOnOpenChange).toHaveBeenCalledWith(false)
        })
    })

    describe('Disconnect button', () => {
        it('should render disconnect button with correct props', () => {
            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            const disconnectButton = buttonCalls.find(
                (call) => call[0].children === 'Disconnect',
            )

            expect(disconnectButton).toBeDefined()
            expect(disconnectButton[0].intent).toBe(ButtonIntent.Destructive)
            expect(disconnectButton[0].size).toBe(ButtonSize.Md)
            expect(disconnectButton[0].variant).toBe(ButtonVariant.Primary)
        })

        it('should not show loading state when not disconnecting', () => {
            renderComponent({ isDisconnectPending: false })

            const buttonCalls = mockButton.mock.calls as any[]
            const disconnectButton = buttonCalls.find(
                (call) => call[0].children === 'Disconnect',
            )

            expect(disconnectButton[0].isLoading).toBe(false)
        })

        it('should show loading state when disconnecting', () => {
            renderComponent({ isDisconnectPending: true })

            const buttonCalls = mockButton.mock.calls as any[]
            const disconnectButton = buttonCalls.find(
                (call) => call[0].children === 'Disconnect',
            )

            expect(disconnectButton[0].isLoading).toBe(true)
        })

        it('should call onDisconnect when clicked', () => {
            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            const disconnectButton = buttonCalls.find(
                (call) => call[0].children === 'Disconnect',
            )

            disconnectButton[0].onClick()

            expect(mockOnDisconnect).toHaveBeenCalled()
        })
    })
})
