import { screen } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { MemoryRouter } from 'react-router-dom'

import client from 'models/api/resources'
import {
    payingWithCreditCard,
    payWithShopify,
    payWithShopifyButNotActivated,
    payWithShopifyButNotActivatedAndPastDue,
    trial,
} from 'pages/settings/new_billing/fixtures'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { ShopifyBillingInactiveBanner } from '../ShopifyBillingInactiveBanner'

const mockedServer = new MockAdapter(client)

describe('ShopifyBillingInactiveBanner', () => {
    afterEach(() => {
        mockedServer.reset()
    })

    it('should render the banner when Shopify billing is inactive', async () => {
        mockedServer
            .onGet('/billing/state')
            .reply(200, payWithShopifyButNotActivated)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <ShopifyBillingInactiveBanner />
            </MemoryRouter>,
            {},
        )

        expect(
            await screen.findByText(
                'Your Shopify billing integration is inactive.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'This may cause payment collection issues, please follow the link to activate the integration.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Activate Billing with Shopify'),
        ).toBeInTheDocument()
    })

    it('should render past due banner when Shopify billing is inactive and subscription is past due', async () => {
        mockedServer
            .onGet('/billing/state')
            .reply(200, payWithShopifyButNotActivatedAndPastDue)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <ShopifyBillingInactiveBanner />
            </MemoryRouter>,
            {},
        )

        expect(
            await screen.findByText('Subscription payment past due'),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Your payment is overdue because your Shopify billing integration is inactive. Please activate it in Store Management to resume payment collection and avoid service interruption.',
            ),
        ).toBeInTheDocument()

        expect(screen.getByText('Go to Store Management')).toBeInTheDocument()
    })

    it('should not render the banner when Shopify billing is active', async () => {
        mockedServer.onGet('/billing/state').reply(200, payWithShopify)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <ShopifyBillingInactiveBanner />
            </MemoryRouter>,
            {},
        )

        // Wait for the query to complete
        await screen.findByText('', { selector: 'body' })

        expect(
            screen.queryByText('Your Shopify billing integration is inactive.'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Subscription payment past due'),
        ).not.toBeInTheDocument()
    })

    it('should not render when not using Shopify billing', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <ShopifyBillingInactiveBanner />
            </MemoryRouter>,
            {},
        )

        // Wait for the query to complete
        await screen.findByText('', { selector: 'body' })

        expect(
            screen.queryByText('Your Shopify billing integration is inactive.'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Subscription payment past due'),
        ).not.toBeInTheDocument()
    })

    it('should not render when Shopify billing is null', async () => {
        mockedServer.onGet('/billing/state').reply(200, trial)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <ShopifyBillingInactiveBanner />
            </MemoryRouter>,
            {},
        )

        // Wait for the query to complete
        await screen.findByText('', { selector: 'body' })

        expect(
            screen.queryByText('Your Shopify billing integration is inactive.'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Subscription payment past due'),
        ).not.toBeInTheDocument()
    })

    it('should render link with correct attributes when Shopify billing is inactive', async () => {
        mockedServer
            .onGet('/billing/state')
            .reply(200, payWithShopifyButNotActivated)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <ShopifyBillingInactiveBanner />
            </MemoryRouter>,
            {},
        )

        const link = await screen.findByRole('link', {
            name: /Activate Billing with Shopify/i,
        })

        expect(link).toHaveAttribute(
            'href',
            '/integrations/shopify/billing/activate',
        )
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render link to Store Management when subscription is past due', async () => {
        mockedServer
            .onGet('/billing/state')
            .reply(200, payWithShopifyButNotActivatedAndPastDue)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <ShopifyBillingInactiveBanner />
            </MemoryRouter>,
            {},
        )

        const link = await screen.findByRole('link', {
            name: /Go to Store Management/i,
        })

        expect(link).toHaveAttribute('href', '/app/settings/store-management')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
})
