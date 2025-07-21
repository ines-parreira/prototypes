import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { BigCommerceIntegration } from 'models/integration/types'

import * as Utils from '../../../../../../integrations/integration/components/bigcommerce/Utils'
import BigCommerceSettings from '../BigCommerceSettings'

jest.mock('pages/integrations/integration/hooks/useQueryNotify', () => ({
    __esModule: true,
    default: () => {},
}))

const mockIntegration = {
    id: 123,
    deactivated_datetime: null,
    meta: {
        shop_domain: 'teststore.mybigcommerce.com',
        store_hash: 'abc123',
        shop_id: 12345,
        webhooks: [],
        currency: 'USD',
        import_state: {
            products: {
                is_over: true,
                oldest_created_at: '2024-01-01T00:00:00Z',
            },
            customers: {
                is_over: true,
                oldest_created_at: '2024-01-01T00:00:00Z',
            },
            external_orders: {
                is_over: true,
                oldest_created_at: '2024-01-01T00:00:00Z',
            },
        },
        need_scope_update: false,
    },
} as unknown as BigCommerceIntegration

describe('BigCommerceSettings', () => {
    const onDeleteIntegration = jest.fn()
    const mockConnectUrl = 'https://example.com/connect'

    beforeEach(() => {
        jest.spyOn(Utils, 'getConnectUrl').mockReturnValue(mockConnectUrl)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders store information and action buttons', () => {
        render(
            <BigCommerceSettings
                integration={mockIntegration}
                onDeleteIntegration={onDeleteIntegration}
            />,
        )

        expect(screen.getByText('Store Information')).toBeInTheDocument()
        expect(screen.getByText('Delete Store')).toBeInTheDocument()
    })

    it('handles delete integration', () => {
        render(
            <BigCommerceSettings
                integration={mockIntegration}
                onDeleteIntegration={onDeleteIntegration}
            />,
        )

        fireEvent.click(screen.getByText('Delete Store'))
        expect(onDeleteIntegration).toHaveBeenCalledWith(mockIntegration)
    })

    it('shows reconnect button when store is deactivated', () => {
        const deactivatedIntegration = {
            ...mockIntegration,
            deactivated_datetime: '2024-01-01T00:00:00Z',
        }

        render(
            <BigCommerceSettings
                integration={deactivatedIntegration}
                onDeleteIntegration={onDeleteIntegration}
            />,
        )

        expect(screen.getByText('Reconnect')).toBeInTheDocument()
    })

    it('shows update permissions button when scope update is needed', () => {
        const integrationNeedingScopeUpdate = {
            ...mockIntegration,
            meta: {
                ...mockIntegration.meta,
                need_scope_update: true,
            },
        }

        render(
            <BigCommerceSettings
                integration={integrationNeedingScopeUpdate}
                onDeleteIntegration={onDeleteIntegration}
            />,
        )

        expect(screen.getByText('Update Permissions')).toBeInTheDocument()
    })

    it('redirects to connect URL when reconnect button is clicked', () => {
        const deactivatedIntegration = {
            ...mockIntegration,
            deactivated_datetime: '2024-01-01T00:00:00Z',
        }

        render(
            <BigCommerceSettings
                integration={deactivatedIntegration}
                onDeleteIntegration={onDeleteIntegration}
            />,
        )

        fireEvent.click(screen.getByText('Reconnect'))
        expect(window.location.href).toBe(mockConnectUrl)
    })
})
