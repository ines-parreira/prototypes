import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {withRouter, browserHistory} from 'react-router'
import {Container} from 'reactstrap'

import BillingUsage from './BillingUsage'
import BillingPaymentMethod from './BillingPaymentMethod'
import BillingInvoices from './BillingInvoices'
import {notify} from '../../../state/notifications/actions'
import PageHeader from '../../common/components/PageHeader'

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
                title: notif_msg.replace(/\+/g, ' '),
                allowHTML: false
            })
            // remove notification from url
            browserHistory.push(window.location.pathname)
        }
    }

    render() {
        return (
            <div className="full-width">
                <PageHeader title="Billing & Usage"/>
                <Container fluid className="page-container">
                    <BillingUsage/>
                    <BillingPaymentMethod/>
                    <BillingInvoices/>
                </Container>
            </div>
        )
    }
}
