import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { IntegrationType, StoreIntegration } from 'models/integration/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithStore } from 'utils/testing'

import General from '../General'
import * as useStoreDeleterHook from '../hooks/useStoreDeleter'

const mockShopifyStore: StoreIntegration = {
    id: 123,
    type: IntegrationType.Shopify,
    name: 'Test Store',
    created_datetime: '2024-01-01T00:00:00Z',
    deactivated_datetime: null,
    meta: {
        shop_name: 'test-store',
        shop_display_name: 'Test Store',
        shop_domain: 'test-store.myshopify.com',
        shop_id: 123456,
    },
} as StoreIntegration

const mockRefetchStore = jest.fn()
const mockDeleteIntegration = jest.fn()

const queryClient = mockQueryClient()

describe('General', () => {
    beforeEach(() => {
        jest.spyOn(useStoreDeleterHook, 'default').mockImplementation(() => ({
            deleteIntegration: mockDeleteIntegration,
            isDeleting: false,
        }))
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders ShopifySettings for Shopify integration', () => {
        renderWithStore(
            <MemoryRouter initialEntries={[`/settings/stores/123`]}>
                <Route path="/settings/stores/:id">
                    <QueryClientProvider client={queryClient}>
                        <General
                            store={mockShopifyStore}
                            refetchStore={mockRefetchStore}
                        />
                    </QueryClientProvider>
                </Route>
            </MemoryRouter>,
            {},
        )

        const myApps = screen.getByText(/my apps/i)

        const link = myApps.closest('a')

        expect(link).toHaveAttribute(
            'href',
            '/app/settings/integrations/shopify/123',
        )
    })

    it('handles delete integration flow', () => {
        renderWithStore(
            <MemoryRouter initialEntries={[`/settings/stores/123`]}>
                <Route path="/settings/stores/:id">
                    <QueryClientProvider client={queryClient}>
                        <General
                            store={mockShopifyStore}
                            refetchStore={mockRefetchStore}
                        />
                    </QueryClientProvider>
                </Route>
            </MemoryRouter>,
            {},
        )

        fireEvent.click(screen.getByRole('button', { name: /delete store/i }))

        expect(
            screen.getByText(
                /Are you sure you want to delete your Shopify store from Gorgias/,
            ),
        ).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

        expect(mockDeleteIntegration).toHaveBeenCalledWith({
            id: mockShopifyStore.id,
        })
    })
})
