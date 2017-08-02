import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import React, {Component, PropTypes} from 'react'

import BillingCurrentSubscription from './BillingCurrentSubscription'
import BillingPlans from './BillingPlans'
import BillingUsage from './BillingUsage'
import BillingPaymentMethod from './BillingPaymentMethod'
import BillingInvoices from './BillingInvoices'
import {notify} from '../../../state/notifications/actions'

@withRouter
@connect(null, {notify})
export default class BillingContainer extends Component {
    static propTypes = {
        // Router
        notify: PropTypes.func.isRequired,
        location: PropTypes.object.isRequired,
    }

    componentWillMount() {
        if (this.props.location.query.error === 'shopify-billing') {
            this.props.notify({
                message: 'Something went wrong while activating billing with Shopify, please try again later.',
                status: 'error'
            })
        } else if (this.props.location.query.success === 'shopify-billing') {
            this.props.notify({
                message: 'Billing with Shopify activated.',
                status: 'success'
            })
        }
    }

    render() {
        return (
            <div>
                <h1>
                    <i className="fa fa-fw fa-credit-card blue mr-2" />
                    Billing
                </h1>

                <BillingCurrentSubscription />
                <BillingPlans />
                <BillingUsage />
                <BillingPaymentMethod />
                <BillingInvoices />
            </div>
        )
    }
}
