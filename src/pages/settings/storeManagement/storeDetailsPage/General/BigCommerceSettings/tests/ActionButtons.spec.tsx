import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { ActionButtons } from '../ActionButtons'

describe('ActionButtons', () => {
    const defaultProps = {
        needScopeUpdate: false,
        isActive: true,
        onRetriggerOAuthFlow: jest.fn(),
        onDelete: jest.fn(),
    }

    const renderComponent = (props = defaultProps) => {
        return render(<ActionButtons {...props} />)
    }

    it('calls onDelete when delete button is clicked', () => {
        renderComponent()

        fireEvent.click(screen.getByText('Delete Store'))
        expect(defaultProps.onDelete).toHaveBeenCalledTimes(1)
    })

    it('handles update permissions button when needScopeUpdate is true', () => {
        renderComponent({
            ...defaultProps,
            needScopeUpdate: true,
        })

        const updateButton = screen.getByText('Update Permissions')
        expect(updateButton).toBeInTheDocument()
        fireEvent.click(updateButton)
        expect(defaultProps.onRetriggerOAuthFlow).toHaveBeenCalledTimes(1)
    })

    it('handles reconnect button when store is not active', () => {
        renderComponent({
            ...defaultProps,
            isActive: false,
        })

        fireEvent.click(screen.getByText('Reconnect'))
        expect(defaultProps.onRetriggerOAuthFlow).toHaveBeenCalledTimes(1)
    })
})
