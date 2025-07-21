import { fireEvent, render, screen } from '@testing-library/react'

import DeleteIntegrationConfirmationModal from '../DeleteIntegrationConfirmationModal'

describe('<DeleteIntegrationConfirmationModal />', () => {
    const defaultProps = {
        isOpen: true,
        setIsOpen: jest.fn(),
        onConfirm: jest.fn(),
        storeType: 'Shopify',
    }

    it('should render modal with correct title and content', () => {
        render(<DeleteIntegrationConfirmationModal {...defaultProps} />)

        expect(screen.getByText('Delete store')).toBeInTheDocument()
        expect(
            screen.getByText(
                /Are you sure you want to delete your Shopify store from Gorgias/,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/This action cannot be undone/),
        ).toBeInTheDocument()
    })

    it('should render delete button with loading state', () => {
        render(
            <DeleteIntegrationConfirmationModal
                {...defaultProps}
                isLoading={true}
            />,
        )

        const deleteButton = screen.getByRole('button', { name: /delete/i })
        expect(deleteButton).toBeInTheDocument()
        expect(deleteButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should call onConfirm when delete button is clicked', () => {
        render(<DeleteIntegrationConfirmationModal {...defaultProps} />)

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
        expect(defaultProps.onConfirm).toHaveBeenCalled()
    })

    it('should call setIsOpen when close button is clicked', () => {
        render(<DeleteIntegrationConfirmationModal {...defaultProps} />)

        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false)
    })

    it('should not render modal when isOpen is false', () => {
        render(
            <DeleteIntegrationConfirmationModal
                {...defaultProps}
                isOpen={false}
            />,
        )

        expect(screen.queryByText('Delete store')).not.toBeInTheDocument()
        expect(
            screen.queryByText(
                /Are you sure you want to delete your Shopify store/,
            ),
        ).not.toBeInTheDocument()
    })

    it('should render with different store type', () => {
        render(
            <DeleteIntegrationConfirmationModal
                {...defaultProps}
                storeType="Magento"
            />,
        )

        expect(
            screen.getByText(
                /Are you sure you want to delete your Magento store from Gorgias/,
            ),
        ).toBeInTheDocument()
    })
})
