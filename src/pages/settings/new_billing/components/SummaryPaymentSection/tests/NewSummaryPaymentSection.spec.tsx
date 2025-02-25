import React from 'react'

import { screen } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'
import {
    payingWithAchCredit,
    payingWithAchDebit,
    payingWithCreditCard,
    payingWithExpiredCreditCard,
    payWithShopify,
    payWithShopifyButNotActivated,
    trial,
} from 'pages/settings/new_billing/fixtures'
import { ignoreHTML } from 'tests/ignoreHTML'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { NewSummaryPaymentSection } from '../NewSummaryPaymentSection'

const mockedServer = new MockAdapter(client)

describe('NewSummaryPaymentSection', () => {
    it('should render the no-payment-method use-case', async () => {
        mockedServer.onGet('/billing/state').reply(200, trial)

        renderWithStoreAndQueryClientProvider(<NewSummaryPaymentSection />, {})

        expect(
            await screen.findByText(
                /No payment method registered on your account/,
            ),
        ).toBeInTheDocument()

        // and merchant can change its payment method
        expect(screen.getByText('Add Payment Method')).toHaveAttribute(
            'to',
            '/app/settings/billing/payment/card',
        )
    })

    it('should render the credit-card use-case', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        renderWithStoreAndQueryClientProvider(<NewSummaryPaymentSection />, {})

        expect(
            await screen.findByText(ignoreHTML(/Visa ending with 4321/)),
        ).toBeInTheDocument()

        expect(screen.queryByText(/is expired/)).not.toBeInTheDocument()

        // and merchant can change its payment method
        expect(screen.getByText('Change Payment Method')).toHaveAttribute(
            'to',
            '/app/settings/billing/payment/card',
        )
    })

    it('should render the expired-credit-card use-case', async () => {
        mockedServer
            .onGet('/billing/state')
            .reply(200, payingWithExpiredCreditCard)

        renderWithStoreAndQueryClientProvider(<NewSummaryPaymentSection />, {})

        expect(
            await screen.findByText(
                ignoreHTML(/Visa ending with 4321 is expired/),
            ),
        ).toBeInTheDocument()

        // and merchant can change its payment method
        expect(screen.getByText('Change Payment Method')).toHaveAttribute(
            'to',
            '/app/settings/billing/payment/card',
        )
    })

    it('should render the ach-debit use-case', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithAchDebit)

        renderWithStoreAndQueryClientProvider(<NewSummaryPaymentSection />, {})

        expect(
            await screen.findByText(
                ignoreHTML(
                    'Bank transfer (ACH debit) from account Wells Fargo ending with 9876',
                ),
            ),
        ).toBeInTheDocument()

        // and merchant can change its payment method
        expect(screen.getByText('Change Payment Method')).toHaveAttribute(
            'to',
            '/app/settings/billing/payment/card',
        )
    })

    it('should render the ach-credit use-case', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithAchCredit)

        renderWithStoreAndQueryClientProvider(<NewSummaryPaymentSection />, {})

        expect(
            await screen.findByText(ignoreHTML('Bank transfer (ACH credit)')),
        ).toBeInTheDocument()

        // and merchant CANNOT change its payment method
        expect(
            screen.queryByText(/Change Payment Method/),
        ).not.toBeInTheDocument()
    })

    it('should render the inactivated-shopify-billing use-case', async () => {
        mockedServer
            .onGet('/billing/state')
            .reply(200, payWithShopifyButNotActivated)

        renderWithStoreAndQueryClientProvider(<NewSummaryPaymentSection />, {})

        expect(
            await screen.findByText(/Payment with Shopify is inactive./),
        ).toBeInTheDocument()

        // and merchant can activate its Shopify Billing
        expect(
            screen.getByText('Activate Billing with Shopify'),
        ).toHaveAttribute('to', '/integrations/shopify/billing/activate/')
    })

    it('should render the activated-shopify-billing use-case', async () => {
        mockedServer.onGet('/billing/state').reply(200, payWithShopify)

        renderWithStoreAndQueryClientProvider(<NewSummaryPaymentSection />, {})

        expect(
            await screen.findByText(
                /Payment with Shopify is active \(Subscription ID: 28982542566\). You're all set./,
            ),
        ).toBeInTheDocument()

        expect(
            screen.queryByText(/Activate Billing with Shopify/),
        ).not.toBeInTheDocument()
    })
})
