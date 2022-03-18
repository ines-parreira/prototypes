import React, {Component} from 'react'
import {Table} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import moment from 'moment'
import {AxiosError} from 'axios'
import {Map} from 'immutable'

import {SHOPIFY_PAYMENT_SERVICE} from 'constants/billing'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Loader from 'pages/common/components/Loader/Loader'
import GorgiasApi from 'services/gorgiasApi'
import {fetchInvoices, updateInvoiceInList} from 'state/billing/actions'
import * as billingSelectors from 'state/billing/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState} from 'state/types'

import BillingHeader from './common/BillingHeader'

type Props = ConnectedProps<typeof connector>

type State = {
    isFetchingInvoices: boolean
    confirmingInvoicePayment: string | null
    payingInvoice: string | null
}

export class BillingInvoicesContainer extends Component<Props, State> {
    gorgiasApi = new GorgiasApi()
    state = {
        isFetchingInvoices: false,
        confirmingInvoicePayment: null,
        payingInvoice: null,
    }

    async componentWillMount() {
        this.setState({isFetchingInvoices: true})
        await this.props.fetchInvoices()
        this.setState({isFetchingInvoices: false})
    }

    _payInvoice = async (invoiceId: string) => {
        const {updateInvoiceInList} = this.props
        this.setState({payingInvoice: invoiceId})

        try {
            const invoice = await this.gorgiasApi.payInvoice(invoiceId)
            updateInvoiceInList(invoice)
        } catch (exc) {
            const error: AxiosError<{error: {msg: string}}> = exc
            if (error.response!.status === 402) {
                // 402: The payment needs to be confirmed by the user.
                await this._confirmInvoicePayment(invoiceId)
                return
            }

            const errorMsg =
                error.response && error.response.data.error
                    ? error.response.data.error.msg
                    : 'Failed to pay the invoice. Please try again in a few seconds.'

            void this.props.notify({
                status: NotificationStatus.Error,
                title: errorMsg,
            })
        } finally {
            this.setState({payingInvoice: null})
        }
    }

    _confirmInvoicePayment = async (invoiceId: string) => {
        const {updateInvoiceInList} = this.props
        this.setState({confirmingInvoicePayment: invoiceId})

        try {
            const invoice = await this.gorgiasApi.confirmInvoicePayment(
                invoiceId
            )
            if (invoice.get('payment_confirmation_url')) {
                window.location.href = invoice.get('payment_confirmation_url')
            } else {
                updateInvoiceInList(invoice)
            }
        } catch (exc) {
            const error: AxiosError<{error?: {msg: string}}> = exc
            const errorMsg =
                error.response && error.response.data.error
                    ? error.response.data.error.msg
                    : 'Failed to confirm the payment. Please try again in a few seconds.'

            void this.props.notify({
                status: NotificationStatus.Error,
                title: errorMsg,
            })
        } finally {
            this.setState({confirmingInvoicePayment: null})
        }
    }

    render() {
        const {invoices} = this.props
        const {isFetchingInvoices, confirmingInvoicePayment, payingInvoice} =
            this.state

        if (isFetchingInvoices) {
            return <Loader />
        }

        if (invoices.isEmpty()) {
            return null
        }

        return (
            <div>
                <BillingHeader icon="receipt">Payment history</BillingHeader>
                <p>
                    The account owner will receive an invoice by email at the
                    start of each billing period.
                </p>
                <Table striped className="table">
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
                        {invoices.map((invoice: Map<any, any>) => {
                            const paid = invoice.get('paid')
                            const invoicePdfUrl = invoice.get('invoice_pdf')
                            const paymentIntent = invoice.get(
                                'payment_intent'
                            ) as Map<any, any>
                            const shopifyPaid =
                                invoice.getIn([
                                    'metadata',
                                    'payment_service',
                                ]) === SHOPIFY_PAYMENT_SERVICE
                            return (
                                <tr key={invoice.get('id')}>
                                    <td className="link-full-td align-middle">
                                        <div className="cell-content">
                                            {paid ? (
                                                <Badge type={ColorType.Success}>
                                                    Paid
                                                </Badge>
                                            ) : (
                                                <Badge type={ColorType.Error}>
                                                    Unpaid
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="link-full-td align-middle">
                                        <div className="cell-content">
                                            {moment
                                                .unix(invoice.get('date'))
                                                .format('LL')}
                                        </div>
                                    </td>
                                    <td className="link-full-td align-middle">
                                        <div className="cell-content">
                                            {`$${
                                                invoice.get('amount_due') / 100
                                            }`}{' '}
                                        </div>
                                    </td>
                                    <td className="link-full-td align-middle">
                                        <div className="cell-content">
                                            {invoice.get('description') || '-'}{' '}
                                        </div>
                                    </td>
                                    <td className="link-full-td align-middle">
                                        {!shopifyPaid && (
                                            <a
                                                className="mr-2"
                                                target="_self"
                                                href={invoicePdfUrl}
                                            >
                                                <Button intent="secondary">
                                                    <ButtonIconLabel icon="file_copy">
                                                        Download PDF
                                                    </ButtonIconLabel>
                                                </Button>
                                            </a>
                                        )}
                                        {paymentIntent &&
                                            paymentIntent.get('status') ===
                                                'requires_source_action' && (
                                                <Button
                                                    isLoading={
                                                        confirmingInvoicePayment ===
                                                        invoice.get('id')
                                                    }
                                                    isDisabled={
                                                        !!confirmingInvoicePayment ||
                                                        !!payingInvoice
                                                    }
                                                    onClick={() => {
                                                        void this._confirmInvoicePayment(
                                                            invoice.get('id')
                                                        )
                                                    }}
                                                >
                                                    Confirm payment
                                                </Button>
                                            )}
                                        {!shopifyPaid &&
                                            paymentIntent &&
                                            paymentIntent.get('status') ===
                                                'requires_source' && (
                                                <Button
                                                    isLoading={
                                                        payingInvoice ===
                                                        invoice.get('id')
                                                    }
                                                    isDisabled={
                                                        !!confirmingInvoicePayment ||
                                                        !!payingInvoice
                                                    }
                                                    onClick={() => {
                                                        void this._payInvoice(
                                                            invoice.get('id')
                                                        )
                                                    }}
                                                >
                                                    Retry payment
                                                </Button>
                                            )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        invoices: billingSelectors.invoices(state),
    }),
    {fetchInvoices, notify, updateInvoiceInList}
)

export default connector(BillingInvoicesContainer)
