import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'

import ConfirmCustomerMatchingModal from '../ConfirmCustomerMatchingModal'

describe('<ConfirmCustomerMatchingModal />', () => {
    const defaultProps = {
        isOpen: true,
        setIsOpen: jest.fn(),
        onConfirm: jest.fn(),
        onCancel: jest.fn(),
    }

    it('should render modal with correct title and content', () => {
        render(<ConfirmCustomerMatchingModal {...defaultProps} />)

        expect(screen.getByText('Enable customer matching')).toBeInTheDocument()
        expect(
            screen.getByText(/Are you sure you want to activate this setting/),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Matching customers by default address may merged unrelated customers/,
            ),
        ).toBeInTheDocument()
    })

    it('should render learn more link with correct href', () => {
        render(<ConfirmCustomerMatchingModal {...defaultProps} />)

        const learnMoreLink = screen.getByText('Learn more')
        expect(learnMoreLink).toHaveAttribute(
            'href',
            '/https://docs.gorgias.com/en-US/shopify-faqs-81985',
        )
    })

    it('should render enable button with loading state', () => {
        render(
            <ConfirmCustomerMatchingModal {...defaultProps} isLoading={true} />,
        )

        const enableButton = screen.getByRole('button', { name: /enable/i })
        expect(enableButton).toBeInTheDocument()
        expect(enableButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should call onConfirm when enable button is clicked', () => {
        render(<ConfirmCustomerMatchingModal {...defaultProps} />)

        fireEvent.click(screen.getByRole('button', { name: 'Enable' }))
        expect(defaultProps.onConfirm).toHaveBeenCalled()
    })

    it('should call onCancel when close button is clicked', () => {
        render(<ConfirmCustomerMatchingModal {...defaultProps} />)

        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        expect(defaultProps.onCancel).toHaveBeenCalled()
    })

    it('should not render modal when isOpen is false', () => {
        render(
            <ConfirmCustomerMatchingModal {...defaultProps} isOpen={false} />,
        )

        expect(
            screen.queryByText('Enable customer matching'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(
                /Are you sure you want to activate this setting/,
            ),
        ).not.toBeInTheDocument()
    })

    it('should call setIsOpen when modal is closed', () => {
        render(<ConfirmCustomerMatchingModal {...defaultProps} />)

        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false)
    })
})
