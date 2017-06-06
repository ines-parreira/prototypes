import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import {BillingPaymentMethod} from '../BillingPaymentMethod'

describe('BillingPaymentMethod.spec.js component', () => {
    it('should render loading', () => {
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

    it('should render empty card', () => {
        const component = mount(
            <BillingPaymentMethod
                fetchPaymentMethod={() => Promise.resolve()}
                fetchCreditCard={() => Promise.resolve()}
                creditCard={fromJS({})}
                paymentMethod={'stripe'}
                paymentIsActive

            />
        )
        component.setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })

    it('should render stripe', () => {
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
            />
        )
        component.setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })

    it('should render shopify active', () => {
        const component = mount(
            <BillingPaymentMethod
                fetchPaymentMethod={() => Promise.resolve()}
                fetchCreditCard={() => Promise.resolve()}
                creditCard={fromJS({})}
                paymentMethod={'shopify'}
                paymentIsActive
            />
        )
        component.setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })

    it('should render shopify inactive', () => {
        const component = mount(
            <BillingPaymentMethod
                fetchPaymentMethod={() => Promise.resolve()}
                fetchCreditCard={() => Promise.resolve()}
                creditCard={fromJS({})}
                paymentMethod={'shopify'}
                paymentIsActive={false}
            />
        )
        component.setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })
})
