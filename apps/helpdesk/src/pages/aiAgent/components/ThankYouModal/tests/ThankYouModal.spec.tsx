import { fireEvent, render, screen } from '@testing-library/react'

import ThankYouModal from '../ThankYouModal'

describe('ThankYouModal', () => {
    const titleTestLabel = 'Test Title'
    const descriptionTestLabel = 'Test Description'
    const actionTestLabel = 'Test Action Label'
    const closeTestLabel = 'Test Close Label'

    const defaultProps = {
        isOpen: true,
        image: <img src="test" alt="Thank you" />,
        title: titleTestLabel,
        description: descriptionTestLabel,
        actionLabel: actionTestLabel,
        closeLabel: closeTestLabel,
        onClick: jest.fn(),
        onClose: jest.fn(),
        isLoading: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders correctly with provided props', () => {
        render(<ThankYouModal {...defaultProps} />)

        expect(screen.getByText(titleTestLabel)).toBeInTheDocument()
        expect(screen.getByText(descriptionTestLabel)).toBeInTheDocument()
        expect(screen.getByText(actionTestLabel)).toBeInTheDocument()
        expect(screen.getByText(closeTestLabel)).toBeInTheDocument()
    })

    it('renders the image correctly', () => {
        render(<ThankYouModal {...defaultProps} />)

        const image = screen.getByAltText('Thank you')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', 'test')
    })

    it('calls onClick when action button is clicked', () => {
        render(<ThankYouModal {...defaultProps} />)

        fireEvent.click(screen.getByText(defaultProps.actionLabel))

        expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when close button is clicked', () => {
        render(<ThankYouModal {...defaultProps} />)

        fireEvent.click(screen.getByText(defaultProps.closeLabel))

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('does not render the modal when isOpen is false', () => {
        render(<ThankYouModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByText(titleTestLabel)).not.toBeInTheDocument()
        expect(screen.queryByText(descriptionTestLabel)).not.toBeInTheDocument()
    })

    it('renders the loading state correctly', () => {
        render(<ThankYouModal {...defaultProps} isLoading={true} />)

        expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument()
    })

    it('ensures the modal has correct accessibility attributes', () => {
        render(<ThankYouModal {...defaultProps} />)

        const modal = screen.getByRole('dialog')
        expect(modal).toHaveAttribute('aria-modal', 'true')
    })

    it('does not throw error when onClick and onClose are undefined', () => {
        const noHandlersProps = {
            ...defaultProps,
            onClick: undefined,
            onClose: undefined,
        }

        expect(() =>
            render(<ThankYouModal {...noHandlersProps} />),
        ).not.toThrow()
    })

    it('does not crash when clicking action button without onClick', () => {
        const noOnClickProps = { ...defaultProps, onClick: undefined }
        render(<ThankYouModal {...noOnClickProps} />)

        const actionButton = screen.getByText(actionTestLabel)
        fireEvent.click(actionButton)

        expect(actionButton).toBeInTheDocument()
    })

    it('does not crash when clicking close button without onClose', () => {
        const noOnCloseProps = { ...defaultProps, onClose: undefined }
        render(<ThankYouModal {...noOnCloseProps} />)

        const closeButton = screen.getByText(closeTestLabel)
        fireEvent.click(closeButton)

        expect(closeButton).toBeInTheDocument()
    })
})
