import React from 'react'

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { DeleteModal } from '../DeleteModal'

describe('DeleteModal', () => {
    const defaultProps = {
        isDeleting: false,
        isModalOpen: true,
        onDelete: jest.fn().mockResolvedValue(undefined),
        setModalOpen: jest.fn(),
        title: 'Delete Confirmation',
        description: 'Are you sure you want to delete this item?',
    }

    it('renders the modal with title, description, and buttons when isModalOpen is true', async () => {
        render(<DeleteModal {...defaultProps} />)

        expect(screen.getByText('Delete Confirmation')).toBeInTheDocument()
        expect(
            screen.getByText('Are you sure you want to delete this item?'),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Delete' }),
        ).toBeInTheDocument()
    })

    it('does not render the modal when isModalOpen is false', () => {
        render(<DeleteModal {...defaultProps} isModalOpen={false} />)

        expect(
            screen.queryByText('Delete Confirmation'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Are you sure you want to delete this item?'),
        ).not.toBeInTheDocument()
    })

    it('calls setModalOpen with false when Cancel button is clicked', async () => {
        const user = userEvent.setup()
        const setModalOpen = jest.fn()

        render(<DeleteModal {...defaultProps} setModalOpen={setModalOpen} />)

        await act(async () => {
            await user.click(screen.getByRole('button', { name: 'Cancel' }))
        })

        expect(setModalOpen).toHaveBeenCalledTimes(1)
        expect(setModalOpen).toHaveBeenCalledWith(false)
    })

    it('calls onDelete when Delete button is clicked', async () => {
        const user = userEvent.setup()
        const onDelete = jest.fn().mockResolvedValue(undefined)

        render(<DeleteModal {...defaultProps} onDelete={onDelete} />)

        await act(async () => {
            await user.click(screen.getByRole('button', { name: 'Delete' }))
        })

        expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('shows loading state on Delete button when isDeleting is true', () => {
        render(<DeleteModal {...defaultProps} isDeleting={true} />)

        const deleteButton = screen.getByRole('button', { name: /Delete/i })
        expect(deleteButton).toHaveAttribute('aria-disabled', 'true')
    })
})
