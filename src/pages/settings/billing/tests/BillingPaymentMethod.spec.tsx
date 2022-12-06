import React, {ComponentProps} from 'react'
import {render, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'

import {PaymentMethodType} from 'state/billing/types'
import {ShopifyBillingStatus} from 'state/currentAccount/types'
import {BillingPaymentMethodContainer} from 'pages/settings/billing/BillingPaymentMethod'

describe('BillingPaymentMethod', () => {
    const minProps: ComponentProps<typeof BillingPaymentMethodContainer> = {
        currentUserId: '1',
        currentAccountDomain: 'foo',
        creditCard: fromJS({}),
        subscription: fromJS({}),
        paymentMethod: PaymentMethodType.Stripe,
        productsAmount: 12,
        productCurrency: 'usd',
        shopifyBillingStatus: ShopifyBillingStatus.Inactive,
        fetchPaymentMethod: jest.fn().mockResolvedValue({}),
        fetchCreditCard: jest.fn().mockResolvedValue({}),
    }

    describe('Stripe', () => {
        it('should render a loader', () => {
            const {container} = render(
                <BillingPaymentMethodContainer {...minProps} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a button', async () => {
            const {container, findByText} = render(
                <BillingPaymentMethodContainer
                    {...minProps}
                    subscription={fromJS({plan: 'basic-usd-1'})}
                />
            )

            await findByText('Add payment method')

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a disabled button', async () => {
            const {container, getByRole} = render(
                <BillingPaymentMethodContainer {...minProps} />
            )

            await waitFor(() => getByRole('button'))

            expect(getByRole('button').closest('button')?.disabled).toBe(true)
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a button to update a credit card', async () => {
            const {container, findByText} = render(
                <BillingPaymentMethodContainer
                    {...minProps}
                    creditCard={fromJS({
                        brand: 'Visa',
                        last4: 4242,
                        exp_month: 9,
                        exp_year: 2017,
                    })}
                    subscription={fromJS({plan: 'basic-usd-1'})}
                />
            )

            await findByText('Change card')

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('Shopify', () => {
        it('should render an active status', async () => {
            const {container, findByText} = render(
                <BillingPaymentMethodContainer
                    {...minProps}
                    paymentMethod={PaymentMethodType.Shopify}
                    subscription={fromJS({plan: 'basic-usd-1'})}
                    shopifyBillingStatus={ShopifyBillingStatus.Active}
                />
            )

            await findByText("Payment with Shopify is active. You're all set.")

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a disabled button', async () => {
            const {container, getByRole} = render(
                <BillingPaymentMethodContainer
                    {...minProps}
                    paymentMethod={PaymentMethodType.Shopify}
                    shopifyBillingStatus={ShopifyBillingStatus.Inactive}
                />
            )

            await waitFor(() => getByRole('button'))

            expect(getByRole('button').closest('button')?.disabled).toBe(true)
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a button to reactivate billing', async () => {
            const {container, findByText} = render(
                <BillingPaymentMethodContainer
                    {...minProps}
                    paymentMethod={PaymentMethodType.Shopify}
                    shopifyBillingStatus={ShopifyBillingStatus.Canceled}
                />
            )

            await findByText('Reactivate billing with Shopify')

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a button', async () => {
            const {container, getByRole} = render(
                <BillingPaymentMethodContainer
                    {...minProps}
                    paymentMethod={PaymentMethodType.Shopify}
                    subscription={fromJS({plan: 'basic-usd-1'})}
                    shopifyBillingStatus={ShopifyBillingStatus.Inactive}
                />
            )
            await waitFor(() => getByRole('button'))
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
