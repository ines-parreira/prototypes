import { createRef } from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import { UnsavedChangesModalProps } from '../UnsavedChangesModal'
import UnsavedChangesPrompt, {
    UnsavedChangesPromptTrigger,
} from '../UnsavedChangesPrompt'
import useUnsavedChangesPrompt from '../useUnsavedChangesPrompt'

const mockUseUnsavedChangesPromptProps = {
    isOpen: true,
    onClose: jest.fn(),
    redirectToOriginalLocation: jest.fn(),
    onNavigateAway: jest.fn(),
    onLeaveContext: jest.fn(),
}

jest.mock('../useUnsavedChangesPrompt')

// Mock the modal component
jest.mock('../UnsavedChangesModal', () => ({
    __esModule: true,
    default: ({
        isOpen,
        onClose,
        onSave,
        onDiscard,
        title,
        body,
        shouldShowSaveButton,
        shouldShowDiscardButton,
    }: UnsavedChangesModalProps) => {
        return (
            <div data-testid="unsaved-changes-modal">
                <div>{isOpen ? 'open' : 'closed'}</div>
                <div>{title}</div>
                <div>{body}</div>
                <div data-testid="modal-actions">
                    {shouldShowDiscardButton && (
                        <button
                            data-testid="discard-button"
                            onClick={onDiscard}
                            type="button"
                        >
                            discard button
                        </button>
                    )}
                    {shouldShowSaveButton && (
                        <button
                            data-testid="save-button"
                            onClick={onSave}
                            type="button"
                        >
                            save button
                        </button>
                    )}
                    <button
                        data-testid="close-button"
                        onClick={onClose}
                        type="button"
                    >
                        close button
                    </button>
                </div>
            </div>
        )
    },
}))

describe('UnsavedChangesPrompt', () => {
    const defaultProps = {
        onDiscard: jest.fn(),
        onSave: jest.fn(),
        shouldRedirectAfterSave: false,
        when: true,
        title: 'Test Title',
        body: 'Test Body',
        shouldShowDiscardButton: true,
        shouldShowSaveButton: true,
    }

    const renderComponent = (props = {}) => {
        const ref = createRef<UnsavedChangesPromptTrigger>()
        const renderResult = render(
            <BrowserRouter>
                <UnsavedChangesPrompt {...defaultProps} {...props} ref={ref} />
            </BrowserRouter>,
        )
        return { ...renderResult, ref }
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useUnsavedChangesPrompt as jest.Mock).mockReturnValue(
            mockUseUnsavedChangesPromptProps,
        )
    })

    describe('Prompt Rendering', () => {
        it('should render modal with the modal props propagated correctly', () => {
            renderComponent()
            screen.getByText('Test Title')
            screen.getByText('Test Body')
            screen.getByText('close button')
            screen.getByText('discard button')
            screen.getByText('save button')
            screen.getByText('open')
        })

        it('should propagate the correct props to the modal when the buttons are hidden', () => {
            renderComponent({
                shouldShowDiscardButton: false,
                shouldShowSaveButton: false,
            })

            screen.getByText('close button')
            expect(screen.queryByText('discard button')).toBeNull()
            expect(screen.queryByText('save button')).toBeNull()
        })

        it('should propagate the isOpen prop to the modal', () => {
            ;(useUnsavedChangesPrompt as jest.Mock).mockImplementation(() => ({
                ...mockUseUnsavedChangesPromptProps,
                isOpen: false,
            }))

            renderComponent()

            screen.getByText('closed')
        })
    })

    describe('Modal Actions', () => {
        it('should handle save action without redirect', async () => {
            const mockOnSave = jest.fn()

            renderComponent({ onSave: mockOnSave })

            act(() => {
                fireEvent.click(screen.getByText('save button'))
            })

            expect(mockOnSave).toHaveBeenCalled()

            mockOnSave.mockResolvedValue(true)

            await waitFor(() => {
                expect(
                    mockUseUnsavedChangesPromptProps.onClose,
                ).toHaveBeenCalled()

                expect(
                    mockUseUnsavedChangesPromptProps.redirectToOriginalLocation,
                ).not.toHaveBeenCalled()
            })
        })

        it('should handle save action with redirect enabled', async () => {
            const mockOnSave = jest.fn()

            const mockRedirectToOriginalLocation = jest.fn()

            ;(useUnsavedChangesPrompt as jest.Mock).mockReturnValue({
                ...mockUseUnsavedChangesPromptProps,
                redirectToOriginalLocation: mockRedirectToOriginalLocation,
            })

            renderComponent({
                onSave: mockOnSave,
                shouldRedirectAfterSave: true,
            })

            mockOnSave.mockResolvedValue(true)

            act(() => {
                fireEvent.click(screen.getByText('save button'))
            })

            expect(mockOnSave).toHaveBeenCalled()

            mockRedirectToOriginalLocation.mockResolvedValue(true)

            await waitFor(() => {
                expect(
                    mockUseUnsavedChangesPromptProps.onClose,
                ).toHaveBeenCalled()

                expect(mockRedirectToOriginalLocation).toHaveBeenCalled()
            })
        })

        it('should handle discard action', async () => {
            const mockOnDiscard = jest.fn()

            renderComponent({ onDiscard: mockOnDiscard })

            act(() => {
                fireEvent.click(screen.getByText('discard button'))
            })

            expect(mockOnDiscard).toHaveBeenCalled()

            await waitFor(() => {
                expect(
                    mockUseUnsavedChangesPromptProps.onClose,
                ).toHaveBeenCalled()
            })
        })

        it('should handle close action', async () => {
            const mockOnSave = jest.fn()
            const mockOnDiscard = jest.fn()

            renderComponent({
                onSave: mockOnSave,
                onDiscard: mockOnDiscard,
            })

            act(() => {
                fireEvent.click(screen.getByText('close button'))
            })

            await waitFor(() => {
                expect(
                    mockUseUnsavedChangesPromptProps.onClose,
                ).toHaveBeenCalled()

                expect(mockOnSave).not.toHaveBeenCalled()
                expect(mockOnDiscard).not.toHaveBeenCalled()
            })
        })
    })

    describe('DeferredPromise Integration', () => {
        it('should trigger onSave callback when save is triggered after opening prompt through onLeaveContext', async () => {
            const mockOnSave = jest.fn()

            const { ref } = renderComponent({ onSave: mockOnSave })

            const mockCallback = {
                onSave: jest.fn(),
                onDiscard: jest.fn(),
                onClose: jest.fn(),
            }

            act(() => {
                ref.current?.onLeaveContext(mockCallback)
                fireEvent.click(screen.getByText('save button'))
            })

            expect(mockOnSave).toHaveBeenCalled()

            mockOnSave.mockResolvedValue(true)

            await waitFor(() => {
                expect(mockCallback.onSave).toHaveBeenCalled()

                expect(mockCallback.onDiscard).not.toHaveBeenCalled()
                expect(mockCallback.onClose).not.toHaveBeenCalled()
            })
        })

        it('should trigger onDiscard callback when discard is triggered after opening prompt through onLeaveContext', async () => {
            const mockOnDiscard = jest.fn()

            const { ref } = renderComponent({ onDiscard: mockOnDiscard })

            const mockCallback = {
                onSave: jest.fn(),
                onDiscard: jest.fn(),
                onClose: jest.fn(),
            }

            act(() => {
                ref.current?.onLeaveContext(mockCallback)
                fireEvent.click(screen.getByText('discard button'))
            })

            expect(mockOnDiscard).toHaveBeenCalled()

            await waitFor(() => {
                expect(mockCallback.onDiscard).toHaveBeenCalled()

                expect(mockCallback.onSave).not.toHaveBeenCalled()
                expect(mockCallback.onClose).not.toHaveBeenCalled()
            })
        })

        it('should trigger onClose callback when close is triggered after opening prompt through onLeaveContext', async () => {
            const { ref } = renderComponent()

            const mockCallback = {
                onSave: jest.fn(),
                onDiscard: jest.fn(),
                onClose: jest.fn(),
            }

            act(() => {
                ref.current?.onLeaveContext(mockCallback)
                fireEvent.click(screen.getByText('close button'))
            })

            expect(mockUseUnsavedChangesPromptProps.onClose).toHaveBeenCalled()

            await waitFor(() => {
                expect(mockCallback.onClose).toHaveBeenCalled()

                expect(mockCallback.onSave).not.toHaveBeenCalled()
                expect(mockCallback.onDiscard).not.toHaveBeenCalled()
            })
        })
    })
})
