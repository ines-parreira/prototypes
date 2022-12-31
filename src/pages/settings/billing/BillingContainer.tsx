import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {Container} from 'reactstrap'
import {parse} from 'qs'

import PageHeader from 'pages/common/components/PageHeader'
import history from 'pages/history'
import {
    getCurrentSubscription,
    hasCreditCard,
} from 'state/currentAccount/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState} from 'state/types'
import {paymentMethod} from 'state/billing/selectors'
import {openChat} from 'utils'

import css from '../settings.less'

import AddOns from './AddOns'
import BillingInvoices from './BillingInvoices'
import BillingPaymentMethod from './BillingPaymentMethod'
import BillingHelpdeskUsage from './BillingHelpdeskUsage'
import BillingDetails from './details/BillingDetails'
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
                title: decodeURIComponent(notif_msg as string).replace(
                    /\+/g,
                    ' '
                ),
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
                <PageHeader title="Billing & usage" />
                <Container fluid className={css.pageContainer}>
                    <BillingHelpdeskUsage />
                    <AddOns />
                    <p className={css.mb24}>
                        If you have any questions or if you want to unsubscribe,
                        please contact us at{' '}
                        <a href={`mailto:${window.GORGIAS_SUPPORT_EMAIL}`}>
                            {window.GORGIAS_SUPPORT_EMAIL}
                        </a>{' '}
                        or{' '}
                        <a href="" onClick={openChat}>
                            Live Chat
                        </a>
                        .
                    </p>
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
        const currentSubscription = getCurrentSubscription(state)
        return {
            currentSubscription,
            paymentMethod: paymentMethod(state),
            hasCreditCard: hasCreditCard(state),
        }
    },
    {notify}
)

export default withRouter(connector(BillingContainer))
