import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import {BillingInvoices} from '../BillingInvoices'

describe('BillingInvoices component', () => {
    it('should display loader', () => {
        const component = mount(
            <BillingInvoices
                fetchInvoices={() => Promise.resolve()}
                invoices={fromJS({})}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should load with empty props', () => {
        const component = mount(
            <BillingInvoices
                fetchInvoices={() => Promise.resolve()}
                invoices={fromJS({})}
            />
        )
        component.setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })

    it('should display invoices', () => {
        const component = mount(
            <BillingInvoices
                fetchInvoices={() => Promise.resolve()}
                invoices={fromJS([
                    {
                        id: 123,
                        paid: false,
                        amount_due: 1000,
                        date: 1496701077,
                        metadata: {
                            tickets: 10
                        }
                    },
                    {
                        id: 125,
                        paid: true,
                        amount_due: 10000,
                        date: 1496701077,
                        metadata: {
                            tickets: 100
                        }
                    },
                ])}
            />
        )
        component.setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })
})
