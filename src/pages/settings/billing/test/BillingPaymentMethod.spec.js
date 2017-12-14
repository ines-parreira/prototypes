import React from 'react'
import {mount, shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {BillingPaymentMethod} from '../BillingPaymentMethod'

describe('BillingPaymentMethod', () => {
    describe('Stripe', () => {
        it('should render a loader', () => {
            const component = mount(
                <BillingPaymentMethod
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({})}
                    paymentMethod={'stripe'}
                    paymentIsActive
                />
            )
            expect(component).toMatchSnapshot()
        })

        it('should render a button', () => {
            const component = mount(
                <BillingPaymentMethod
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({})}
                    paymentMethod={'stripe'}
                    paymentIsActive
                    subscription={fromJS({plan: 'basic-usd-1'})}
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })

        it('should render a disabled button', () => {
            const component = shallow(
                <BillingPaymentMethod
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({})}
                    paymentMethod={'stripe'}
                    subscription={fromJS({})}
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })

        it('should render a button to update a credit card', () => {
            const component = mount(
                <BillingPaymentMethod
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({
                        brand: 'Visa',
                        last4: 4242,
                        exp_month: 9,
                        exp_year: 2017
                    })}
                    paymentMethod={'stripe'}
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
                <BillingPaymentMethod
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({})}
                    paymentMethod={'shopify'}
                    paymentIsActive
                    subscription={fromJS({plan: 'basic-usd-1'})}
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })

        it('should render a disabled button', () => {
            const component = shallow(
                <BillingPaymentMethod
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({})}
                    paymentMethod={'shopify'}
                    paymentIsActive={false}
                    subscription={fromJS({})}
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })

        it('should render a button', () => {
            const component = mount(
                <BillingPaymentMethod
                    fetchPaymentMethod={() => Promise.resolve()}
                    fetchCreditCard={() => Promise.resolve()}
                    creditCard={fromJS({})}
                    paymentMethod={'shopify'}
                    paymentIsActive={false}
                    subscription={fromJS({plan: 'basic-usd-1'})}
                />
            )
            component.setState({isLoading: false})
            expect(component).toMatchSnapshot()
        })
    })
})
