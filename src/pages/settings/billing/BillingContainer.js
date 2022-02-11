import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {Container} from 'reactstrap'
import {parse} from 'qs'

import {notify} from '../../../state/notifications/actions.ts'
import PageHeader from '../../common/components/PageHeader.tsx'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors.ts'
import history from '../../history.ts'
import {paymentMethod} from '../../../state/billing/selectors.ts'
import css from '../settings.less'

import BillingUsage from './BillingUsage.tsx'
import BillingPaymentMethod from './BillingPaymentMethod.tsx'
import BillingDetails from './details/BillingDetails.tsx'
import BillingInvoices from './BillingInvoices.tsx'

@withRouter
export class BillingContainer extends Component {
    static propTypes = {
        // Router
        location: PropTypes.object.isRequired,
        // history: PropTypes.object.isRequired,

        notify: PropTypes.func.isRequired,
        currentSubscription: PropTypes.object.isRequired,
        hasCreditCard: PropTypes.bool.isRequired,
        paymentMethod: PropTypes.string.isRequired,
    }

    componentDidMount() {
        // display message from url
        const {notif_msg, notif_type} = parse(this.props.location.search, {
            ignoreQueryPrefix: true,
        })

        if (notif_msg) {
            this.props.notify({
                status: notif_type,
                title: notif_msg.replace(/\+/g, ' '),
                allowHTML: false,
            })
            // remove notification from url
            history.push(window.location.pathname)
        }

        const {currentSubscription} = this.props
        if (currentSubscription.isEmpty()) {
            history.push('/app/settings/billing/plans')
        }
    }

    render() {
        const {paymentMethod, hasCreditCard} = this.props

        return (
            <div className="full-width">
                <PageHeader title="Billing & Usage" />
                <Container fluid className={css.pageContainer}>
                    <BillingUsage />
                    <BillingPaymentMethod />
                    {(paymentMethod === 'shopify' || hasCreditCard) && (
                        <BillingDetails />
                    )}
                    <BillingInvoices />
                </Container>
            </div>
        )
    }
}

export default connect(
    (state) => {
        const currentSubscription =
            currentAccountSelectors.getCurrentSubscription(state)
        return {
            currentSubscription,
            paymentMethod: paymentMethod(state),
            hasCreditCard: currentAccountSelectors.hasCreditCard(state),
        }
    },
    {notify}
)(BillingContainer)
