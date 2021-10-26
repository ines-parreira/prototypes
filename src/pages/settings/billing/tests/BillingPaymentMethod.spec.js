import React from 'react'
import {mount, shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {BillingPaymentMethodContainer} from '../BillingPaymentMethod'

describe('BillingPaymentMethod', () => {
    describe('Stripe', () => {
        it('should render a loader', () => {
            const component = mount(
                <BillingPaymentMethodContainer
                    currentPlan={fromJS({})}
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({})}
                    paymentMethod="stripe"
                    paymentIsActive
                />
            )
            expect(component).toMatchSnapshot()
        })

        it('should render a button', () => {
            const component = mount(
                <BillingPaymentMethodContainer
                    currentPlan={fromJS({})}
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({})}
                    paymentMethod="stripe"
                    paymentIsActive
                    subscription={fromJS({plan: 'basic-usd-1'})}
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })

        it('should render a disabled button', () => {
            const component = shallow(
                <BillingPaymentMethodContainer
                    currentPlan={fromJS({})}
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({})}
                    paymentMethod="stripe"
                    subscription={fromJS({})}
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })

        it('should render a button to update a credit card', () => {
            const component = mount(
                <BillingPaymentMethodContainer
                    currentPlan={fromJS({})}
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({
                        brand: 'Visa',
                        last4: 4242,
                        exp_month: 9,
                        exp_year: 2017,
                    })}
                    paymentMethod="stripe"
                    paymentIsActive
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
                    currentPlan={fromJS({})}
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({})}
                    paymentMethod="shopify"
                    paymentIsActive
                    subscription={fromJS({plan: 'basic-usd-1'})}
                    shopifyBillingStatus="active"
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })

        it('should render a disabled button', () => {
            const component = shallow(
                <BillingPaymentMethodContainer
                    currentPlan={fromJS({})}
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({})}
                    paymentMethod="shopify"
                    paymentIsActive={false}
                    subscription={fromJS({})}
                    shopifyBillingStatus="inactive"
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })

        it('should render a button to reactivate billing', () => {
            const component = shallow(
                <BillingPaymentMethodContainer
                    currentPlan={fromJS({})}
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({})}
                    paymentMethod="shopify"
                    paymentIsActive={false}
                    subscription={fromJS({})}
                    shopifyBillingStatus="canceled"
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })

        it('should render a button', () => {
            const component = mount(
                <BillingPaymentMethodContainer
                    currentPlan={fromJS({
                        amount: 12,
                        currencySign: '$',
                    })}
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({})}
                    paymentMethod="shopify"
                    paymentIsActive={false}
                    subscription={fromJS({plan: 'basic-usd-1'})}
                    shopifyBillingStatus="inactive"
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })
    })
})
