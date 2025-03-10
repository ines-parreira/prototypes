import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import { Map } from 'immutable'

import ShopifyCustomerProfileSync from '../ShopifyCustomerProfileSync'

describe('ShopifyCustomerProfileSync', () => {
    const activeCustomer = Map({ name: 'John Smith' })

    test('renders the button and modal', () => {
        render(<ShopifyCustomerProfileSync activeCustomer={activeCustomer} />)

        const syncButton = screen.getByText('Sync Profile')
        expect(syncButton).toBeInTheDocument()

        const modalTitle = screen.queryByText(
            'Sync customer John Smith with Shopify',
        )
        expect(modalTitle).not.toBeInTheDocument()

        fireEvent.click(syncButton)

        expect(
            screen.getByText('Sync customer John Smith with Shopify'),
        ).toBeInTheDocument()
    })

    test('closes the modal when onClose is called', async () => {
        render(<ShopifyCustomerProfileSync activeCustomer={activeCustomer} />)

        const syncButton = screen.getByText('Sync Profile')
        fireEvent.click(syncButton)

        expect(
            screen.getByText('Sync customer John Smith with Shopify'),
        ).toBeInTheDocument()

        const closeButton = screen.getByText(/close/i, { selector: 'i' })
        fireEvent.click(closeButton)

        await waitFor(() => {
            expect(
                screen.queryByText('Sync customer John Smith with Shopify'),
            ).not.toBeInTheDocument()
        })
    })
})
