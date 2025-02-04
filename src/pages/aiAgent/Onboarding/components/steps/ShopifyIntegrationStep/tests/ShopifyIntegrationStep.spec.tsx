import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'

import '@testing-library/jest-dom/extend-expect'
import {StoreIntegration} from 'models/integration/types'
import {ShopifyIntegrationStep} from 'pages/aiAgent/Onboarding/components/steps/ShopifyIntegrationStep/ShopifyIntegrationStep'
import {useShopifyIntegrations} from 'pages/aiAgent/Onboarding/hooks/useShopifyIntegrations'

import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {useEmailIntegrations} from 'pages/settings/contactForm/hooks/useEmailIntegrations'

// Mock the useShopifyIntegrations hook
jest.mock('pages/aiAgent/Onboarding/hooks/useShopifyIntegrations')
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope')
jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')

const mockUseShopifyIntegrations = useShopifyIntegrations as jest.Mock
const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock

const queryClient = new QueryClient()

const renderComponent = (shopifyIntegrations: StoreIntegration[] = []) => {
    mockUseShopifyIntegrations.mockReturnValue(shopifyIntegrations)
    return render(
        <>
            <QueryClientProvider client={queryClient}>
                <ShopifyIntegrationStep
                    currentStep={1}
                    totalSteps={3}
                    setCurrentStep={jest.fn()}
                />
            </QueryClientProvider>
        </>
    )
}

describe('ShopifyIntegrationStep', () => {
    beforeEach(() => {
        // Populate the return values of the mocked hooks
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: true,
        })
    })

    it('renders without crashing', () => {
        renderComponent()
        expect(screen.getByText('Connect Shopify')).toBeInTheDocument()
    })

    it('displays connected status when an integration is selected', () => {
        const integrations = [{id: 1, name: 'Test Store'}]
        renderComponent(integrations as StoreIntegration[])
        expect(
            screen.getByText(
                "You're already connected to Shopify. Click next to proceed."
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Connected')).toBeInTheDocument()
    })

    it('displays disconnected status when no integration is selected', () => {
        renderComponent()
        expect(screen.getByText('Disconnected')).toBeInTheDocument()
    })

    it('calls setOnboardingData with the selected integration name', () => {
        const integrations = [{id: 1, name: 'Test Store'}]
        renderComponent(integrations as StoreIntegration[])

        // Check that the dropdown selector reflects the chosen store
        expect(screen.getByText('Test Store')).toBeInTheDocument()
    })

    it('opens Shopify URL when Connect button is clicked', () => {
        const originalOpen = window.open
        window.open = jest.fn()
        renderComponent()
        fireEvent.click(screen.getByText('Connect'))
        expect(window.open).toHaveBeenCalledWith(
            'https://apps.shopify.com/helpdesk',
            '_self'
        )
        window.open = originalOpen
    })

    it('opens Shopify URL when "Need to create a new store?" link is clicked', () => {
        const originalOpen = window.open
        window.open = jest.fn()
        const integrations = [{id: 1, name: 'Test Store'}]
        renderComponent(integrations as StoreIntegration[])
        fireEvent.click(
            screen.getByText('Need to create a new store? Click here')
        )
        expect(window.open).toHaveBeenCalledWith(
            'https://apps.shopify.com/helpdesk',
            '_self'
        )
        window.open = originalOpen
    })

    it('renders the dropdown when there are integrations', () => {
        const integrations = [{id: 1, name: 'Test Store'}]
        renderComponent(integrations as StoreIntegration[])
        expect(screen.getByText('arrow_drop_down')).toBeInTheDocument()
    })

    it('renders the "Connect to Shopify" button when there are no integrations', () => {
        renderComponent()
        expect(screen.getByText('Connect')).toBeInTheDocument()
    })

    it('renders the AI banner when the status is connected', () => {
        const integrations = [{id: 1, name: 'Test Store'}]
        renderComponent(integrations as StoreIntegration[])
        expect(
            screen.getByText(
                "You're already connected to Shopify. Click next to proceed."
            )
        ).toBeInTheDocument()
    })

    it('renders the AI banner with alternative text when there are multiple integrations', () => {
        const integrations = [
            {id: 1, name: 'Test Store'},
            {id: 2, name: 'Test Store 2'},
        ]
        renderComponent(integrations as StoreIntegration[])
        expect(
            screen.getByText(
                "You're already connected to Shopify. Select your store to proceed."
            )
        ).toBeInTheDocument()
    })
})
