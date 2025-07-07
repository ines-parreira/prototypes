import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import ConfirmButtonWithModal from '../ConfirmButtonWithModal'

const renderComponent = (props = {}) => {
    return render(
        <ConfirmButtonWithModal
            confirmationContent={<div>Confirmation Content</div>}
            onConfirm={jest.fn()}
            {...props}
        >
            Delete Item
        </ConfirmButtonWithModal>,
    )
}

describe('ConfirmButtonWithModal', () => {
    it('renders the button with children', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Delete Item' }),
        ).toBeInTheDocument()
    })

    it('opens modal when button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const button = screen.getByRole('button', { name: 'Delete Item' })
        await act(() => user.click(button))

        expect(screen.getByText('Are you sure?')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Confirm' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
    })

    it('calls onConfirm when confirm button is clicked', async () => {
        const onConfirm = jest.fn()
        const user = userEvent.setup()
        renderComponent({ onConfirm })

        const button = screen.getByRole('button', { name: 'Delete Item' })
        await act(() => user.click(button))

        const confirmButton = screen.getByRole('button', { name: 'Confirm' })
        await act(() => user.click(confirmButton))

        expect(onConfirm).toHaveBeenCalledTimes(1)
        await waitFor(() => {
            expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
        })
    })

    it('calls onCancel when cancel button is clicked', async () => {
        const onCancel = jest.fn()
        const user = userEvent.setup()
        renderComponent({ onCancel })

        const button = screen.getByRole('button', { name: 'Delete Item' })
        await act(() => user.click(button))

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        await act(() => user.click(cancelButton))

        expect(onCancel).toHaveBeenCalledTimes(1)
        await waitFor(() => {
            expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
        })
    })

    it('closes modal when close button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const button = screen.getByRole('button', { name: 'Delete Item' })
        await act(() => user.click(button))

        const closeButton = screen.getByText('close')
        await act(() => user.click(closeButton))

        await waitFor(() => {
            expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
        })
    })

    it('displays custom title, content, confirm and cancel labels', async () => {
        const user = userEvent.setup()
        renderComponent({
            confirmationTitle: 'Custom Title',
            confirmationContent: <p>Custom Content</p>,
            confirmLabel: 'Custom Confirm',
            cancelLabel: 'Custom Cancel',
        })

        const button = screen.getByRole('button', { name: 'Delete Item' })
        await act(() => user.click(button))

        expect(screen.getByText('Custom Title')).toBeInTheDocument()
        expect(screen.getByText('Custom Content')).toBeInTheDocument()
        expect(screen.getByText('Custom Confirm')).toBeInTheDocument()
        expect(screen.getByText('Custom Cancel')).toBeInTheDocument()
    })

    it('hides cancel button when showCancelButton is false', async () => {
        const user = userEvent.setup()
        renderComponent({ showCancelButton: false })

        const button = screen.getByRole('button', { name: 'Delete Item' })
        await act(() => user.click(button))

        expect(
            screen.queryByRole('button', { name: 'Cancel' }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Confirm' }),
        ).toBeInTheDocument()
    })

    it('handles missing onCancel gracefully', async () => {
        const user = userEvent.setup()
        renderComponent()

        const button = screen.getByRole('button', { name: 'Delete Item' })
        await act(() => user.click(button))

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        await act(() => user.click(cancelButton))

        await waitFor(() => {
            expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
        })
    })
})
