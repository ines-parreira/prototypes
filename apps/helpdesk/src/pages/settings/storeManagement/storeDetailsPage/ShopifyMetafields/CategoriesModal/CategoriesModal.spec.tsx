import React from 'react'

import { act } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CategoriesModal from './CategoriesModal'

describe('CategoriesModal', () => {
    it('should render the modal with correct structure', async () => {
        const user = userEvent.setup()
        const mockOnClose = jest.fn()
        render(<CategoriesModal isOpen onClose={mockOnClose} />)

        expect(
            screen.getByText('Import Shopify metafields to Gorgias'),
        ).toBeInTheDocument()
        expect(screen.getByText('Customers')).toBeInTheDocument()
        expect(screen.getByText('Orders')).toBeInTheDocument()
        expect(screen.getByText('Draft Orders')).toBeInTheDocument()

        const closeIcon = screen.getByText('close')
        const closeButton = closeIcon.closest('button')!
        await act(async () => {
            await user.click(closeButton)
        })
        expect(mockOnClose).toHaveBeenCalled()
    })
})
