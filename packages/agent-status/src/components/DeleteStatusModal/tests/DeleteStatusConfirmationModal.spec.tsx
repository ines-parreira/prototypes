import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as useDeleteStatusModule from '../../../hooks/useDeleteCustomUserAvailabilityStatus'
import { render } from '../../../tests/render.utils'
import * as useLegacyBridgeModule from '../../../utils/LegacyBridge'
import { DeleteStatusConfirmationModal } from '../DeleteStatusConfirmationModal'

vi.mock('../../../hooks/useDeleteCustomUserAvailabilityStatus', () => ({
    useDeleteCustomUserAvailabilityStatus: vi.fn(),
}))

vi.mock('../../../utils/LegacyBridge', () => ({
    useAgentStatusLegacyBridge: vi.fn(),
}))

describe('DeleteStatusConfirmationModal', () => {
    const mockMutateAsync = vi.fn()
    const mockDispatchNotification = vi.fn()
    const mockOnOpenChange = vi.fn()

    const defaultProps = {
        isOpen: true,
        onOpenChange: mockOnOpenChange,
        statusId: 'status-123',
        statusName: 'Lunch Break',
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(
            useDeleteStatusModule.useDeleteCustomUserAvailabilityStatus,
        ).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: false,
        } as any)
        vi.mocked(
            useLegacyBridgeModule.useAgentStatusLegacyBridge,
        ).mockReturnValue({
            dispatchNotification: mockDispatchNotification,
        } as any)
    })

    describe('Rendering', () => {
        it('should render modal with correct title', () => {
            render(<DeleteStatusConfirmationModal {...defaultProps} />)

            expect(screen.getByText('Delete status?')).toBeInTheDocument()
        })

        it('should display status name in confirmation message', () => {
            render(<DeleteStatusConfirmationModal {...defaultProps} />)

            const message = screen.getByText(/You are about to delete/)
            expect(message).toBeInTheDocument()
            expect(screen.getByText('Lunch Break')).toBeInTheDocument()
            expect(
                screen.getByText(/This action cannot be undone/),
            ).toBeInTheDocument()
        })

        it('should render Cancel and Delete buttons', () => {
            render(<DeleteStatusConfirmationModal {...defaultProps} />)

            expect(
                screen.getByRole('button', { name: /Cancel/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Delete status/i }),
            ).toBeInTheDocument()
        })

        it('should not render when isOpen is false', () => {
            render(
                <DeleteStatusConfirmationModal
                    {...defaultProps}
                    isOpen={false}
                />,
            )

            expect(screen.queryByText('Delete status?')).not.toBeInTheDocument()
        })
    })

    describe('User Interactions', () => {
        it('should call onOpenChange with false when Cancel button is clicked', async () => {
            const user = userEvent.setup()
            render(<DeleteStatusConfirmationModal {...defaultProps} />)

            const cancelButton = screen.getByRole('button', {
                name: /Cancel/i,
            })

            await act(() => user.click(cancelButton))

            expect(mockOnOpenChange).toHaveBeenCalled()
            expect(mockMutateAsync).not.toHaveBeenCalled()
        })

        it('should call mutateAsync when Delete button is clicked', async () => {
            const user = userEvent.setup()
            mockMutateAsync.mockResolvedValue(undefined)

            render(<DeleteStatusConfirmationModal {...defaultProps} />)

            const deleteButton = screen.getByRole('button', {
                name: /Delete status/i,
            })

            await act(() => user.click(deleteButton))

            expect(mockMutateAsync).toHaveBeenCalledWith({ pk: 'status-123' })
        })

        it('should dispatch success notification and close modal after successful delete', async () => {
            const user = userEvent.setup()
            mockMutateAsync.mockResolvedValue(undefined)

            render(<DeleteStatusConfirmationModal {...defaultProps} />)

            const deleteButton = screen.getByRole('button', {
                name: /Delete status/i,
            })

            await act(() => user.click(deleteButton))

            expect(mockDispatchNotification).toHaveBeenCalledWith({
                status: 'success',
                message: 'Status "Lunch Break" has been deleted',
                dismissAfter: 5000,
            })
            expect(mockOnOpenChange).toHaveBeenCalled()
        })

        it('should dispatch error notification and keep modal open if delete fails', async () => {
            const user = userEvent.setup()
            mockMutateAsync.mockRejectedValue(new Error('Delete failed'))

            render(<DeleteStatusConfirmationModal {...defaultProps} />)

            const deleteButton = screen.getByRole('button', {
                name: /Delete status/i,
            })

            await act(() => user.click(deleteButton))

            expect(mockMutateAsync).toHaveBeenCalled()
            expect(mockDispatchNotification).toHaveBeenCalledWith({
                status: 'error',
                message: 'Failed to delete status. Please try again.',
            })
            expect(mockOnOpenChange).not.toHaveBeenCalled()
        })
    })

    describe('Hook Integration', () => {
        it('should call useDeleteCustomUserAvailabilityStatus hook', () => {
            render(<DeleteStatusConfirmationModal {...defaultProps} />)

            expect(
                useDeleteStatusModule.useDeleteCustomUserAvailabilityStatus,
            ).toHaveBeenCalled()
        })

        it('should handle different status names in notification', async () => {
            const user = userEvent.setup()
            mockMutateAsync.mockResolvedValue(undefined)

            render(
                <DeleteStatusConfirmationModal
                    {...defaultProps}
                    statusName="Coffee Break"
                />,
            )

            const deleteButton = screen.getByRole('button', {
                name: /Delete status/i,
            })

            await act(() => user.click(deleteButton))

            expect(mockDispatchNotification).toHaveBeenCalledWith({
                status: 'success',
                message: 'Status "Coffee Break" has been deleted',
                dismissAfter: 5000,
            })
        })
    })

    describe('Loading States', () => {
        it('should disable Cancel button when delete is loading', () => {
            vi.mocked(
                useDeleteStatusModule.useDeleteCustomUserAvailabilityStatus,
            ).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isLoading: true,
            } as any)

            render(<DeleteStatusConfirmationModal {...defaultProps} />)

            const cancelButton = screen.getByRole('button', {
                name: /Cancel/i,
            })

            expect(cancelButton).toBeDisabled()
        })

        it('should show loading state on Delete button when delete is loading', () => {
            vi.mocked(
                useDeleteStatusModule.useDeleteCustomUserAvailabilityStatus,
            ).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isLoading: true,
            } as any)

            render(<DeleteStatusConfirmationModal {...defaultProps} />)

            const deleteButton = screen.getByRole('button', {
                name: /Delete status/i,
            })

            // Button should be disabled when loading
            expect(deleteButton).toBeDisabled()
        })

        it('should enable buttons when delete is not loading', () => {
            render(<DeleteStatusConfirmationModal {...defaultProps} />)

            const cancelButton = screen.getByRole('button', {
                name: /Cancel/i,
            })
            const deleteButton = screen.getByRole('button', {
                name: /Delete status/i,
            })

            expect(cancelButton).not.toBeDisabled()
            expect(deleteButton).not.toBeDisabled()
        })
    })

    describe('Accessibility', () => {
        it('should have proper modal structure', () => {
            render(<DeleteStatusConfirmationModal {...defaultProps} />)

            const modal = screen.getByRole('dialog')
            expect(modal).toBeInTheDocument()
        })

        it('should have heading for the modal title', () => {
            render(<DeleteStatusConfirmationModal {...defaultProps} />)

            const heading = screen.getByRole('heading', {
                name: /Delete status?/i,
            })
            expect(heading).toBeInTheDocument()
        })

        it('should have properly labeled buttons', () => {
            render(<DeleteStatusConfirmationModal {...defaultProps} />)

            const cancelButton = screen.getByRole('button', { name: /Cancel/i })
            const deleteButton = screen.getByRole('button', {
                name: /Delete status/i,
            })

            expect(cancelButton).toBeInTheDocument()
            expect(deleteButton).toBeInTheDocument()
        })
    })
})
