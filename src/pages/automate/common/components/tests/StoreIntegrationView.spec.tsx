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

    test('renders image with correct src and alt attributes', () => {
        render(<StoreIntegrationView title="Test Title" />)
        const imgElement = screen.getByAltText('Feature preview')
        expect(imgElement).toBeInTheDocument()
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
        const descriptionElement = screen.getByText(
            'Connect Shopify, Magento or BigCommerce stores to start using Automate!',
        )
        expect(descriptionElement).toBeInTheDocument()
    })

    test('renders LinkButton with correct href', () => {
        render(<StoreIntegrationView title="Test Title" />)
        const linkButtonElement = screen.getByText('Go to app store')
        expect(linkButtonElement).toBeInTheDocument()
    })
})
