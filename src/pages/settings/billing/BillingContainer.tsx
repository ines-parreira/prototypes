import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {Container} from 'reactstrap'
import {parse} from 'qs'

import {RootState} from 'state/types'
import {NotificationStatus} from 'state/notifications/types'
import PageHeader from 'pages/common/components/PageHeader'
import {notify} from 'state/notifications/actions'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors'
import history from '../../history'
import {paymentMethod} from '../../../state/billing/selectors'
import css from '../settings.less'

import BillingUsage from './BillingUsage'
import BillingPaymentMethod from './BillingPaymentMethod'
import BillingDetails from './details/BillingDetails'
import BillingInvoices from './BillingInvoices'

type Props = RouteComponentProps & ConnectedProps<typeof connector>

export class BillingContainer extends Component<Props> {
    componentDidMount() {
        // display message from url
        const {notif_msg, notif_type} = parse(this.props.location.search, {
            ignoreQueryPrefix: true,
        })

        if (notif_msg) {
            void this.props.notify({
                status: notif_type as NotificationStatus,
                title: (notif_msg as string).replace(/\+/g, ' '),
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

const connector = connect(
    (state: RootState) => {
        const currentSubscription =
            currentAccountSelectors.getCurrentSubscription(state)
        return {
            currentSubscription,
            paymentMethod: paymentMethod(state),
            hasCreditCard: currentAccountSelectors.hasCreditCard(state),
        }
    },
    {notify}
)

export default withRouter(connector(BillingContainer))
