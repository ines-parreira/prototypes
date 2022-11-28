import React, {ComponentProps} from 'react'
import {mount, shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {BillingPaymentMethodContainer} from '../BillingPaymentMethod'
import {PaymentMethodType} from '../../../../state/billing/types'
import {ShopifyBillingStatus} from '../../../../state/currentAccount/types'

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
            const component = mount(
                <BillingPaymentMethodContainer {...minProps} />
            )
            expect(component).toMatchSnapshot()
        })

        it('should render a button', () => {
            const component = mount(
                <BillingPaymentMethodContainer
                    {...minProps}
                    subscription={fromJS({plan: 'basic-usd-1'})}
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })

        it('should render a disabled button', () => {
            const component = shallow(
                <BillingPaymentMethodContainer {...minProps} />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })

        it('should render a button to update a credit card', () => {
            const component = mount(
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
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })
    })

    describe('Shopify', () => {
        it('should render an active status', () => {
            const component = mount(
                <BillingPaymentMethodContainer
                    {...minProps}
                    paymentMethod={PaymentMethodType.Shopify}
                    subscription={fromJS({plan: 'basic-usd-1'})}
                    shopifyBillingStatus={ShopifyBillingStatus.Active}
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })

        it('should render a disabled button', () => {
            const component = shallow(
                <BillingPaymentMethodContainer
                    {...minProps}
                    paymentMethod={PaymentMethodType.Shopify}
                    shopifyBillingStatus={ShopifyBillingStatus.Inactive}
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })

        it('should render a button to reactivate billing', () => {
            const component = shallow(
                <BillingPaymentMethodContainer
                    {...minProps}
                    paymentMethod={PaymentMethodType.Shopify}
                    shopifyBillingStatus={ShopifyBillingStatus.Canceled}
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })

        it('should render a button', () => {
            const component = mount(
                <BillingPaymentMethodContainer
                    {...minProps}
                    paymentMethod={PaymentMethodType.Shopify}
                    subscription={fromJS({plan: 'basic-usd-1'})}
                    shopifyBillingStatus={ShopifyBillingStatus.Inactive}
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })
    })
})
