import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import {
    payingWithCreditCard,
    payWithShopify,
    payWithShopifyButNotActivated,
    payWithShopifyButNotActivatedAndPastDue,
    trial,
} from '@repo/billing/fixtures'

import { getBillingState } from 'models/billing/resources'

import { ShopifyBillingInactiveBanner } from '../ShopifyBillingInactiveBanner'

jest.mock('models/billing/resources', () => ({
    ...jest.requireActual('models/billing/resources'),
    getBillingState: jest.fn(),
}))

const mockGetBillingState = getBillingState as jest.Mock

describe('ShopifyBillingInactiveBanner', () => {
    beforeEach(() => {
        mockGetBillingState.mockReset()
    })

    it('should render the banner when Shopify billing is inactive', async () => {
        mockGetBillingState.mockResolvedValue(payWithShopifyButNotActivated)
        render(<ShopifyBillingInactiveBanner />, { storeState: {} })
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
        mockGetBillingState.mockResolvedValue(
            payWithShopifyButNotActivatedAndPastDue,
        )
        render(<ShopifyBillingInactiveBanner />, { storeState: {} })
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
        mockGetBillingState.mockResolvedValue(payWithShopify)
        render(<ShopifyBillingInactiveBanner />, { storeState: {} })
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
        mockGetBillingState.mockResolvedValue(payingWithCreditCard)
        render(<ShopifyBillingInactiveBanner />, { storeState: {} })
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
        mockGetBillingState.mockResolvedValue(trial)
        render(<ShopifyBillingInactiveBanner />, { storeState: {} })
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
        mockGetBillingState.mockResolvedValue(payWithShopifyButNotActivated)
        render(<ShopifyBillingInactiveBanner />, { storeState: {} })
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
        mockGetBillingState.mockResolvedValue(
            payWithShopifyButNotActivatedAndPastDue,
        )
        render(<ShopifyBillingInactiveBanner />, { storeState: {} })
        const link = await screen.findByRole('link', {
            name: /Go to Store Management/i,
        })
        expect(link).toHaveAttribute('href', '/app/settings/store-management')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
})
