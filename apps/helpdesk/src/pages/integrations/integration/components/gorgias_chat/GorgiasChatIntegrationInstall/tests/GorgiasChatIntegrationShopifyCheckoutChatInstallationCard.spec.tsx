import React from 'react'

import { render, screen } from '@testing-library/react'
import { Map } from 'immutable'

import useShopifyCheckoutChatInstallation from '../../hooks/useShopifyCheckoutChatInstallation'
import GorgiasChatIntegrationShopifyCheckoutChatInstallationCard from '../GorgiasChatIntegrationShopifyCheckoutChatInstallationCard'

jest.mock('../../hooks/useShopifyCheckoutChatInstallation', () => ({
    __esModule: true,
    default: jest.fn(),
}))

describe('GorgiasChatIntegrationShopifyCheckoutChatInstallationCard', () => {
    const mockIntegration = Map({
        id: 'integration123',
    })
    const shopifyCheckoutChatInstallationUrl =
        'https://admin.shopify.com/store/settings/checkout/editor'

    it('renders correctly when the chat widget is installed on Shopify Checkout', () => {
        // Given
        ;(useShopifyCheckoutChatInstallation as jest.Mock).mockReturnValue({
            installedOnShopifyCheckout: true,
            shopifyCheckoutChatInstallationUrl,
        })

        // When
        render(
            <GorgiasChatIntegrationShopifyCheckoutChatInstallationCard
                integration={mockIntegration}
                isOneClickInstallation={true}
            />,
        )

        // Then
        expect(
            screen.getByText('Shopify checkout and thank you pages'),
        ).toBeInTheDocument()
        expect(screen.getByText(/Manage Chat/)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Manage/ })).toHaveAttribute(
            'href',
            shopifyCheckoutChatInstallationUrl,
        )
        expect(screen.getByText('check_circle')).toBeInTheDocument()
        expect(screen.getByText('open_in_new')).toBeInTheDocument()
    })

    it('renders correctly when the chat widget is not installed on Shopify Checkout, and one-click installation is not used', () => {
        // Given
        ;(useShopifyCheckoutChatInstallation as jest.Mock).mockReturnValue({
            installedOnShopifyCheckout: false,
            shopifyCheckoutChatInstallationUrl: null,
        })

        // When
        render(
            <GorgiasChatIntegrationShopifyCheckoutChatInstallationCard
                integration={mockIntegration}
                isOneClickInstallation={false}
            />,
        )

        // Then
        expect(
            screen.getByText('Shopify checkout and thank you pages'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/quick installation method/),
        ).toBeInTheDocument()
        expect(screen.queryByRole('link')).not.toBeInTheDocument()
        expect(screen.queryByText('check_circle')).not.toBeInTheDocument()
        expect(screen.queryByText('open_in_new')).not.toBeInTheDocument()
    })

    it('renders correctly when the chat widget is not installed on Shopify Checkout, and one-click installation is used', () => {
        // Given
        ;(useShopifyCheckoutChatInstallation as jest.Mock).mockReturnValue({
            installedOnShopifyCheckout: false,
            shopifyCheckoutChatInstallationUrl,
        })

        // When
        render(
            <GorgiasChatIntegrationShopifyCheckoutChatInstallationCard
                integration={mockIntegration}
                isOneClickInstallation={true}
            />,
        )

        // Then
        expect(
            screen.getByText('Shopify checkout and thank you pages'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Add Chat to your checkout/),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /Learn more/ }),
        ).toHaveAttribute('href', 'https://link.gorgias.com/wzv')
        expect(screen.getByRole('link', { name: /Install/ })).toHaveAttribute(
            'href',
            shopifyCheckoutChatInstallationUrl,
        )
        expect(screen.queryByText('check_circle')).not.toBeInTheDocument()
        expect(screen.getByText('open_in_new')).toBeInTheDocument()
    })
})
