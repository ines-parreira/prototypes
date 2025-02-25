import React from 'react'

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
    }

    it('renders', () => {
        render(<ThankYouModal {...defaultProps} />)

        expect(screen.getByText(titleTestLabel)).toBeInTheDocument()
        expect(screen.getByText(descriptionTestLabel)).toBeInTheDocument()
        expect(screen.getByText(actionTestLabel)).toBeInTheDocument()
        expect(screen.getByText(closeTestLabel)).toBeInTheDocument()
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
})
