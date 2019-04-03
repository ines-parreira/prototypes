// @flow
import React, {Component} from 'react'
import {Table, Badge} from 'reactstrap'
import {connect} from 'react-redux'

import moment from 'moment'

import type {dispatchType} from '../../../types'

import {SHOPIFY_PAYMENT_SERVICE} from '../../../constants/billing'
import * as billingSelectors from '../../../state/billing/selectors'
import {fetchInvoices} from '../../../state/billing/actions'
import Loader from '../../common/components/Loader'

type Props = {
    fetchInvoices: () => Promise<dispatchType>,
    invoices: Object,
}

type State = {
    isLoading: boolean,
}

export class BillingInvoices extends Component<Props, State> {
    state = {
        isLoading: false,
    }

    componentWillMount() {
        this.setState({isLoading: true})
        this.props.fetchInvoices().then(() => {
            this.setState({isLoading: false})
        })
    }

    render() {
        const {invoices} = this.props
        if (this.state.isLoading) {
            return <Loader/>
        }

        if (invoices.isEmpty()) {
            return null
        }

        return (
            <div>
                <h4>
                    <i className="material-icons">receipt</i> Payment history
                </h4>
                <p>
                    The account owner will receive an invoice by email at the start of each billing period.
                </p>
                <Table striped>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Description</th>
                            <th>Invoice</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            invoices.map((invoice) => {
                                const paid = invoice.get('paid')
                                const invoicePdfUrl = invoice.get('invoice_pdf')
                                const shopifyPaid = invoice.getIn(
                                    ['metadata', 'payment_service']) == SHOPIFY_PAYMENT_SERVICE
                                return (
                                    <tr key={invoice.get('id')}>
                                        <td>
                                            {paid ? (
                                                <Badge color="success">Paid</Badge>
                                            ) : (
                                                <Badge color="danger">Unpaid</Badge>
                                            )}
                                        </td>
                                        <td>{moment.unix(invoice.get('date')).format('LL')}</td>
                                        <td>{`$${invoice.get('amount_due') / 100}`} </td>
                                        <td>{invoice.get('description') || '-'} </td>
                                        <td>
                                            {
                                                shopifyPaid ? (
                                                    <em>Paid via Shopify</em>
                                                ) : (
                                                    invoicePdfUrl ? (
                                                        <a href={invoicePdfUrl}>
                                                            <i className="material-icons">file_copy</i>
                                                            Download PDF
                                                        </a>
                                                    ) : ('-')
                                                )
                                            }
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
            </div>
        )
    }
}

export default connect((state) => {
    return {
        invoices: billingSelectors.invoices(state)
    }
}, {fetchInvoices})(BillingInvoices)
