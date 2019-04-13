import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {withRouter, browserHistory} from 'react-router'
import {Container} from 'reactstrap'

import {notify} from '../../../state/notifications/actions'
import PageHeader from '../../common/components/PageHeader'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors'

import BillingUsage from './BillingUsage'
import BillingPaymentMethod from './BillingPaymentMethod'
import BillingDetails from './details/BillingDetails'
import BillingInvoices from './BillingInvoices'

@withRouter
export class BillingContainer extends Component {
    static propTypes = {
        // Router
        location: PropTypes.object.isRequired,
        // history: PropTypes.object.isRequired,

        notify: PropTypes.func.isRequired,
        currentSubscription: PropTypes.object.isRequired,
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

        const {currentSubscription} = this.props
        if (currentSubscription.isEmpty()) {
            browserHistory.push('/app/settings/billing/plans')
        }

    }

    render() {
        return (
            <div className="full-width">
                <PageHeader title="Billing & Usage"/>
                <Container
                    fluid
                    className="page-container"
                >
                    <BillingUsage/>
                    <BillingPaymentMethod/>
                    <BillingDetails/>
                    <BillingInvoices/>
                </Container>
            </div>
        )
    }
}

export default connect((state) => {
    const currentSubscription = currentAccountSelectors.getCurrentSubscription(state)
    return {
        currentSubscription,
    }
}, {notify})(BillingContainer)
