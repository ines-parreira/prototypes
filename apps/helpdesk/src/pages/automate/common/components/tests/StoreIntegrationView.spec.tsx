import React from 'react'

import { render, screen } from '@testing-library/react'

import StoreIntegrationView from '../StoreIntegrationView'

describe('StoreIntegrationView', () => {
    test('renders PageHeader with correct title', () => {
        const title = 'Test Title'
        render(<StoreIntegrationView title={title} />)
        const headerElement = screen.getByText(title)
        expect(headerElement).toBeInTheDocument()
    })

    test('renders correct title text', () => {
        render(<StoreIntegrationView title="Test Title" />)
        const titleElement = screen.getByText(
            'You don’t have a store connected',
        )
        expect(titleElement).toBeInTheDocument()
    })

    test('renders correct description text', () => {
        render(<StoreIntegrationView title="Test Title" />)
        expect(
            screen.getByText(/Connect your store to start using AI Agent\./),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Note: AI Agent is currently available only with Shopify\./,
            ),
        ).toBeInTheDocument()
    })

    test('renders LinkButton with correct text and href', () => {
        render(<StoreIntegrationView title="Test Title" />)
        const linkButton = screen.getByRole('link', {
            name: 'Connect My Shopify Store',
        })
        expect(linkButton).toBeInTheDocument()
        expect(linkButton).toHaveAttribute(
            'href',
            '/app/settings/integrations/shopify',
        )
    })
})
