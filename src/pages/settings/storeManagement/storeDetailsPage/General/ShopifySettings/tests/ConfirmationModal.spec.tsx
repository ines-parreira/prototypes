import { fireEvent, render, screen } from '@testing-library/react'

import ConfirmationModal from '../ConfirmationModal'

describe('<ConfirmationModal />', () => {
    const defaultProps = {
        isOpen: true,
        setIsOpen: jest.fn(),
        title: 'Test Modal',
        confirmButtonText: 'Confirm',
        children: <div>Modal content</div>,
    }

    it('should render modal when isOpen is true', () => {
        render(<ConfirmationModal {...defaultProps} />)

        expect(screen.getByText('Test Modal')).toBeInTheDocument()
        expect(screen.getByText('Modal content')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Close' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Confirm' }),
        ).toBeInTheDocument()
    })

    it('should not render modal when isOpen is false', () => {
        render(<ConfirmationModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
        expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    })

    it('should call onConfirm and setIsOpen when confirm button is clicked', () => {
        const onConfirm = jest.fn()
        render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />)

        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

        expect(onConfirm).toHaveBeenCalled()
        expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false)
    })

    it('should call onCancel and setIsOpen when cancel button is clicked', () => {
        const onCancel = jest.fn()
        render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />)

        fireEvent.click(screen.getByRole('button', { name: 'Close' }))

        expect(onCancel).toHaveBeenCalled()
        expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false)
    })

    it('should call setIsOpen when modal is closed via onClose', () => {
        render(<ConfirmationModal {...defaultProps} />)

        const modal = screen.getByRole('dialog')
        fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' })

        expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false)
    })

    it('should show loading state on confirm button', () => {
        render(<ConfirmationModal {...defaultProps} isLoading={true} />)

        const confirmButton = screen.getByRole('button', { name: /confirm/i })
        expect(confirmButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should render custom confirm button text', () => {
        render(
            <ConfirmationModal
                {...defaultProps}
                confirmButtonText="Custom Action"
            />,
        )

        expect(
            screen.getByRole('button', { name: 'Custom Action' }),
        ).toBeInTheDocument()
    })

    it('should render custom title', () => {
        render(<ConfirmationModal {...defaultProps} title="Custom Title" />)

        expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })
})
