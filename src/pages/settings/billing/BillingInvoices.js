// @flow
import classnames from 'classnames'
import React, {Component} from 'react'
import {Badge, Button, Table} from 'reactstrap'
import {connect} from 'react-redux'

import moment from 'moment'

import {Link} from 'react-router'

import type {dispatchType} from '../../../types'

import {SHOPIFY_PAYMENT_SERVICE} from '../../../constants/billing'
import * as billingSelectors from '../../../state/billing/selectors'
import {fetchInvoices, updateInvoiceInList} from '../../../state/billing/actions'
import Loader from '../../common/components/Loader'
import GorgiasApi from '../../../services/gorgiasApi'
import {notify} from '../../../state/notifications/actions'

type Props = {
    fetchInvoices: () => Promise<dispatchType>,
    notify: (Object) => Promise<dispatchType>,
    updateInvoiceInList: (Object) => Promise<dispatchType>,
    invoices: Object,
}

type State = {
    isFetchingInvoices: boolean,
    confirmingInvoicePayment: ?string,
    payingInvoice: ?string,
}

export class BillingInvoices extends Component<Props, State> {
    gorgiasApi = new GorgiasApi()
    state = {
        isFetchingInvoices: false,
        confirmingInvoicePayment: null,
        payingInvoice: null
    }

    // $FlowFixMe
    async componentWillMount() {
        this.setState({isFetchingInvoices: true})
        await this.props.fetchInvoices()
        this.setState({isFetchingInvoices: false})
    }

    _payInvoice = async(invoiceId: string) => {
        const {updateInvoiceInList} = this.props
        this.setState({payingInvoice: invoiceId})

        try {
            const invoice = await this.gorgiasApi.payInvoice(invoiceId)
            updateInvoiceInList(invoice)
        } catch (exc) {
            if (exc.response.status === 402) {
                // 402: The payment needs to be confirmed by the user.
                await this._confirmInvoicePayment(invoiceId)
                return
            }

            let errorMsg = exc.response && exc.response.data.error
                ? exc.response.data.error.msg
                : 'Failed to pay the invoice. Please try again in a few seconds.'

            this.props.notify({status: 'error', title: errorMsg})
        } finally {
            this.setState({payingInvoice: null})
        }
    }

    _confirmInvoicePayment = async(invoiceId: string) => {
        const {updateInvoiceInList} = this.props
        this.setState({confirmingInvoicePayment: invoiceId})

        try {
            const invoice = await this.gorgiasApi.confirmInvoicePayment(invoiceId)
            if (invoice.get('payment_confirmation_url')) {
                window.location.href = invoice.get('payment_confirmation_url')
            } else {
                updateInvoiceInList(invoice)
            }
        } catch (exc) {
            let errorMsg = exc.response && exc.response.data.error
                ? exc.response.data.error.msg
                : 'Failed to confirm the payment. Please try again in a few seconds.'

            this.props.notify({status: 'error', title: errorMsg})
        } finally {
            this.setState({confirmingInvoicePayment: null})
        }
    }

    render() {
        const {invoices} = this.props
        const {isFetchingInvoices, confirmingInvoicePayment, payingInvoice} = this.state

        if (isFetchingInvoices) {
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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            invoices.map((invoice) => {
                                const paid = invoice.get('paid')
                                const invoicePdfUrl = invoice.get('invoice_pdf')
                                const paymentIntent = invoice.get('payment_intent')
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
                                            {!shopifyPaid && (
                                                <Link
                                                    color="secondary"
                                                    to={invoicePdfUrl}
                                                    className="btn btn-secondary mr-2"
                                                    target="_self"
                                                >
                                                    <i className="material-icons mr-1">file_copy</i>
                                                    Download PDF
                                                </Link>
                                            )}
                                            {paymentIntent && paymentIntent.get('status') === 'requires_source_action' && (
                                                <Button
                                                    color="success"
                                                    className={classnames({
                                                        'btn-loading': confirmingInvoicePayment === invoice.get('id'),
                                                    })}
                                                    disabled={!!confirmingInvoicePayment || !!payingInvoice}
                                                    onClick={() => {
                                                        this._confirmInvoicePayment(invoice.get('id'))
                                                    }}
                                                >
                                                    Confirm payment
                                                </Button>
                                            )}
                                            {!shopifyPaid && paymentIntent && paymentIntent.get('status') === 'requires_source' && (
                                                <Button
                                                    color="success"
                                                    className={classnames({
                                                        'btn-loading': payingInvoice === invoice.get('id'),
                                                    })}
                                                    disabled={!!confirmingInvoicePayment || !!payingInvoice}
                                                    onClick={() => {
                                                        this._payInvoice(invoice.get('id'))
                                                    }}
                                                >
                                                    Retry payment
                                                </Button>
                                            )}
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
}, {fetchInvoices, notify, updateInvoiceInList})(BillingInvoices)
