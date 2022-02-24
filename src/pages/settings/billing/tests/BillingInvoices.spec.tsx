import React, {ComponentProps} from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import {BillingInvoicesContainer} from '../BillingInvoices'

describe('BillingInvoices component', () => {
    const minProps: Omit<
        ComponentProps<typeof BillingInvoicesContainer>,
        'invoices'
    > = {
        notify: jest.fn(),
        updateInvoiceInList: jest.fn(),
        fetchInvoices: () => Promise.resolve(),
    }

    it('should display loader', () => {
        const component = mount(
            <BillingInvoicesContainer {...minProps} invoices={fromJS({})} />
        )
        expect(component).toMatchSnapshot()
    })

    it('should load with empty props', () => {
        const component = mount(
            <BillingInvoicesContainer {...minProps} invoices={fromJS({})} />
        )
        component.setState({isFetchingInvoices: false})
        expect(component).toMatchSnapshot()
    })

    it('should display invoices, without PDF download links if paid through Shopify', () => {
        const component = mount(
            <BillingInvoicesContainer
                {...minProps}
                invoices={fromJS([
                    {
                        id: 123,
                        paid: false,
                        amount_due: 1000,
                        date: 1496701077,
                        metadata: {
                            tickets: 10,
                            payment_service: 'shopify',
                        },
                        invoice_pdf:
                            'https://pay.stripe.com/invoice/example123/pdf',
                    },
                    {
                        id: 125,
                        paid: true,
                        amount_due: 10000,
                        date: 1496701077,
                        metadata: {
                            tickets: 100,
                            payment_service: 'stripe',
                        },
                        invoice_pdf:
                            'https://pay.stripe.com/invoice/example125/pdf',
                    },
                ])}
            />
        )
        component.setState({isFetchingInvoices: false})
        expect(component).toMatchSnapshot()
    })
})
