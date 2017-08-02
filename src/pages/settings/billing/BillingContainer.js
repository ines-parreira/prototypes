import {connect} from 'react-redux'
import {withRouter, browserHistory} from 'react-router'
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

    componentDidMount() {
        // display message from url
        const {
            notif_msg,
            notif_type
        } = this.props.location.query

        if (notif_msg) {
            this.props.notify({
                status: notif_type,
                title: notif_msg.replace(/\+/g, ' ')
            })
            // remove notification from url
            browserHistory.push(window.location.pathname)
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
