import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Map } from 'immutable'
import { Provider } from 'react-redux'

import { mockQueryClient } from '../../../../../tests/reactQueryTestingUtils'
import { mockStore } from '../../../../../utils/testing'
import ShopifyCustomerProfileSync from '../ShopifyCustomerProfileSync'

const queryClient = mockQueryClient()

const state = {}

describe('ShopifyCustomerProfileSync', () => {
    const activeCustomer = Map({ name: 'John Smith' })

    test('renders the button and modal', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <ShopifyCustomerProfileSync
                        activeCustomer={activeCustomer}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        const syncButton = screen.getByText('Sync Profile')
        expect(syncButton).toBeInTheDocument()

        const modalTitle = screen.queryByText(
            'Sync John Smith profile to Shopify',
        )
        expect(modalTitle).not.toBeInTheDocument()

        fireEvent.click(syncButton)

        expect(
            screen.getByText('Sync John Smith profile to Shopify'),
        ).toBeInTheDocument()
    })

    test('closes the modal when onClose is called', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <ShopifyCustomerProfileSync
                        activeCustomer={activeCustomer}
                    />
                </Provider>
            </QueryClientProvider>,
        )
        const syncButton = screen.getByText('Sync Profile')
        fireEvent.click(syncButton)

        expect(
            screen.getByText('Sync John Smith profile to Shopify'),
        ).toBeInTheDocument()

        const closeButton = screen.getByText(/close/i, { selector: 'i' })
        fireEvent.click(closeButton)

        await waitFor(() => {
            expect(
                screen.queryByText('Sync John Smith profile to Shopify'),
            ).not.toBeInTheDocument()
        })
    })
})
