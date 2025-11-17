import type { ComponentProps } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { ShopifyActionButtons } from '../ShopifyActionButtons'

describe('<ShopifyActionButtons />', () => {
    const minProps: ComponentProps<typeof ShopifyActionButtons> = {
        needScopeUpdate: false,
        isActive: true,
        isSubmitting: false,
        areIntegrationOptionsDirty: false,
        onRetriggerOAuthFlow: jest.fn(),
        onCancel: jest.fn(),
        onDelete: jest.fn(),
    }

    it('should render save and cancel buttons by default', () => {
        render(<ShopifyActionButtons {...minProps} />)

        expect(
            screen.getByRole('button', { name: 'Save Changes' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Delete Store' }),
        ).toBeInTheDocument()
    })

    it('should show update permissions button when scope update is needed', () => {
        render(<ShopifyActionButtons {...minProps} needScopeUpdate={true} />)

        const updateButton = screen.getByRole('button', {
            name: 'Update Permissions',
        })
        expect(updateButton).toBeInTheDocument()

        fireEvent.click(updateButton)
        expect(minProps.onRetriggerOAuthFlow).toHaveBeenCalled()
    })

    it('should show reconnect button when integration is not active', () => {
        render(<ShopifyActionButtons {...minProps} isActive={false} />)

        const reconnectButton = screen.getByRole('button', {
            name: 'Reconnect',
        })
        expect(reconnectButton).toBeInTheDocument()

        fireEvent.click(reconnectButton)
        expect(minProps.onRetriggerOAuthFlow).toHaveBeenCalled()
    })

    it('should disable save button when no changes are made', () => {
        render(
            <ShopifyActionButtons
                {...minProps}
                areIntegrationOptionsDirty={false}
            />,
        )

        expect(
            screen.getByRole('button', { name: 'Save Changes' }),
        ).toHaveAttribute('aria-disabled', 'true')
    })

    it('should enable save button when changes are made', () => {
        render(
            <ShopifyActionButtons
                {...minProps}
                areIntegrationOptionsDirty={true}
            />,
        )

        expect(
            screen.getByRole('button', { name: 'Save Changes' }),
        ).toHaveAttribute('aria-disabled', 'false')
    })

    it('should disable all buttons when submitting', () => {
        render(<ShopifyActionButtons {...minProps} isSubmitting={true} />)

        expect(
            screen.getByRole('button', { name: 'Save Changes' }),
        ).toHaveAttribute('aria-disabled', 'true')
        expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute(
            'aria-disabled',
            'true',
        )
        expect(
            screen.getByRole('button', { name: 'Delete Store' }),
        ).toHaveAttribute('aria-disabled', 'true')
    })

    it('should handle cancel button click', () => {
        render(<ShopifyActionButtons {...minProps} />)

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        expect(minProps.onCancel).toHaveBeenCalled()
    })

    it('should handle delete button click', () => {
        render(<ShopifyActionButtons {...minProps} />)

        fireEvent.click(screen.getByRole('button', { name: 'Delete Store' }))
        expect(minProps.onDelete).toHaveBeenCalled()
    })
})
