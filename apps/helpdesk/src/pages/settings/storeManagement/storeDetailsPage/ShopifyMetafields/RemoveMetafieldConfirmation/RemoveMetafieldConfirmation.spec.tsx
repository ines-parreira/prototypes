import React from 'react'

import { act, render, screen } from '@testing-library/react'
import user from '@testing-library/user-event'

import RemoveMetafieldConfirmation from './RemoveMetafieldConfirmation'

describe('RemoveMetafieldConfirmation', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render modal when isOpen is true', () => {
        render(<RemoveMetafieldConfirmation {...defaultProps} />)

        expect(screen.getByText('Remove metafield?')).toBeInTheDocument()
        expect(
            screen.getByText(
                /Once removed, the metafield data won't be available to use in Gorgias/,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Remove' }),
        ).toBeInTheDocument()
    })

    it('should not render modal when isOpen is false', () => {
        render(<RemoveMetafieldConfirmation {...defaultProps} isOpen={false} />)

        expect(screen.queryByText('Remove metafield?')).not.toBeInTheDocument()
        expect(
            screen.queryByText(
                /Once removed, the metafield data won't be available to use in Gorgias/,
            ),
        ).not.toBeInTheDocument()
    })

    it('should call onClose when Cancel button is clicked', async () => {
        render(<RemoveMetafieldConfirmation {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        await act(async () => {
            await user.click(cancelButton)
        })

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call both onConfirm when Remove button is clicked', async () => {
        render(<RemoveMetafieldConfirmation {...defaultProps} />)

        const removeButton = screen.getByRole('button', { name: 'Remove' })
        await act(async () => {
            await user.click(removeButton)
        })

        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should render the full warning message about metafield removal', () => {
        render(<RemoveMetafieldConfirmation {...defaultProps} />)

        expect(
            screen.getByText(
                "Once removed, the metafield data won't be available to use in Gorgias, or to view in the customer profile. You can add it back at any time.",
            ),
        ).toBeInTheDocument()
    })
})
