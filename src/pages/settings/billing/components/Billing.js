import React, {Component, PropTypes} from 'react'
import {Link} from 'react-router'
import moment from 'moment'
import {Loader} from '../../../common/components/Loader'
import css from './Billing.less'

export default class Billing extends Component {
    static propTypes = {
        isFetchingCurrentUsage: PropTypes.bool.isRequired,
        isFetchingCreditCard: PropTypes.bool.isRequired,
        isFetchingInvoices: PropTypes.bool.isRequired,
        plan: PropTypes.object.isRequired,
        usage: PropTypes.object.isRequired,
        creditCard: PropTypes.object.isRequired,
        invoices: PropTypes.object.isRequired,
        paymentMethod: PropTypes.bool.isRequired,
        paymentIsActive: PropTypes.bool.isRequired,
        fetchCurrentUsage: PropTypes.func.isRequired,
        fetchCreditCard: PropTypes.func.isRequired,
        fetchInvoices: PropTypes.func.isRequired,
        notify: PropTypes.func.isRequired,
        numbTicketExample: PropTypes.number.isRequired,

        // Router
        location: PropTypes.object.isRequired,
    }

    static defaultProps = {
        numbTicketExample: 1000,
        shouldPayWithShopify: false,
        doesPayWithShopify: false
    }

    componentWillMount() {
        this.props.fetchCurrentUsage()
        this.props.fetchCreditCard()
        this.props.fetchInvoices()

        if (this.props.location.query.error === 'shopify-billing') {
            this.props.notify({
                message: 'Something went wrong while activating billing with Shopify, please try again later.',
                type: 'error'
            })
        } else if (this.props.location.query.success === 'shopify-billing') {
            this.props.notify({
                message: 'Billing with Shopify activated.',
                type: 'success'
            })
        }
    }

    render() {
        const {
            isFetchingCurrentUsage,
            isFetchingCreditCard,
            isFetchingInvoices,
            usage,
            creditCard,
            invoices,
            numbTicketExample
        } = this.props

        if ((isFetchingCurrentUsage && usage.isEmpty()) ||
            (isFetchingCreditCard && creditCard.isEmpty()) ||
            (isFetchingInvoices && invoices.isEmpty())) {
            return (<Loader/>)
        }

        const {plan, paymentMethod, paymentIsActive} = this.props
        const costExample = plan.get('cost_per_ticket') * numbTicketExample

        return (
            <div className="ui grid">
                <div className="sixteen wide column">
                    <h1>
                        <i className="credit card alternative blue icon ml5ni mr10i"/>
                        Billing
                    </h1>
                    <p>
                        Gorgias' pricing is based on the <strong>number of tickets you respond to every
                        month</strong>.
                        We only count tickets that contain <strong>at least one message from an agent</strong> in
                        your
                        team.<br/>
                        {
                            costExample
                                ? `The first ${plan.get('free_tickets')} tickets per month are on us.
                                 Then we charge $${costExample}/${numbTicketExample} tickets,
                                 and the cost per ticket goes down as the number of ticket increases.`
                                : 'Your plan include an unlimited number of tickets per month.'
                        }
                        <br/>

                        Learn more on our <Link to="https://gorgias.io/pricing" target="_blank"><strong>pricing page</strong></Link>.
                    </p>
                    <div className="row">
                        <p>
                            <strong className="mr10">Current usage</strong>
                            {
                                `${moment(usage.getIn(['meta', 'start_datetime'])).format('MM/DD')}
                                -
                                ${moment(usage.getIn(['meta', 'end_datetime'])).format('MM/DD')}`
                            }
                        </p>
                        <div className={css.statistics}>
                            <div className="ui large statistic">
                                <div className="value">
                                    {usage.getIn(['data', 'tickets'])}
                                </div>
                                <div className="label">
                                    tickets
                                </div>
                            </div>
                            <div className="ui large statistic">
                                <div className="value">
                                    ${usage.getIn(['data', 'cost'])}
                                </div>
                                <div className="label">
                                    cost
                                </div>
                            </div>
                        </div>
                        <p className="mt10">
                            If you have any questions or if you want to unsubscribe, please
                            contact us at <a href="mailto:support@gorgias.io">support@gorgias.io</a>.
                        </p>
                    </div>
                    <div className="row mt20">
                        <strong>Payment method</strong>
                        {
                            paymentMethod === 'stripe' ? (
                                <div>
                                    <p className="mv5">
                                        {
                                            creditCard.isEmpty() ?
                                            'No credit card registered' :
                                            `${creditCard.get('brand')} ending in ${creditCard.get('last4')}
                                            •
                                            ${creditCard.get('exp_month')}/${creditCard.get('exp_year')}`
                                        }
                                    </p>
                                    {
                                        creditCard.isEmpty() ?
                                            <Link
                                                className="ui green button"
                                                to="/app/settings/billing/add-credit-card"
                                            >
                                                ADD CREDIT CARD
                                            </Link>
                                            :
                                            <Link
                                                className="ui grey basic button"
                                                to="/app/settings/billing/update-credit-card"
                                            >
                                                UPDATE CREDIT CARD
                                            </Link>
                                    }
                                </div>
                            ) : (
                                <div>
                                    <p className="mv5">
                                        {
                                            paymentIsActive && 'Payment with Shopify activated.'
                                        }
                                    </p>
                                    {
                                        !paymentIsActive && (
                                            <a
                                                className="ui green button"
                                                href="/integrations/shopify/billing/activate/"
                                            >
                                                ACTIVATE BILLING WITH SHOPIFY
                                            </a>
                                        )
                                    }
                                </div>
                            )
                        }
                    </div>
                    <div className={`row mt20 ${css.paymentsWrapper}`}>
                        <strong>Payments history</strong>
                        {
                            invoices.isEmpty() ? <p>No payments</p> :
                                <table className="ui table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Tickets</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            invoices.map((invoice) => (
                                                <tr key={invoice.get('id')}>
                                                    <td>{moment.unix(invoice.get('date')).format('LL')}</td>
                                                    <td>
                                                        {invoice.get('paid')
                                                            ? <span className="ui green basic mini label">PAID</span>
                                                            : <span className="ui red basic mini label">UNPAID</span>
                                                        }
                                                    </td>
                                                    <td>{`${invoice.getIn(['metadata', 'tickets'], '-')}`} </td>
                                                    <td>{`$${invoice.get('amount_due') / 100}`} </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                        }
                    </div>
                </div>
            </div>
        )
    }
}
