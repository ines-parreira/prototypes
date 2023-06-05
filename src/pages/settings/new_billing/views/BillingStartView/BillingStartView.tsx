import React from 'react'
import {Container} from 'reactstrap'
import {NavLink, Route, Switch} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    BILLING_BASE_PATH,
    BILLING_PAYMENTS_HISTORY,
    BILLING_PAYMENT_PATH,
} from '../../constants'
import UsageAndPlansView from '../UsageAndPlansView'
import PaymentInformationView from '../PaymentInformationView/PaymentInformationView'
import PaymentsHistoryView from '../PaymentHistoryView/PaymentsHistoryView'
import css from './BillingStartView.less'

const BillingStartView = () => {
    const hasAccessToNewBilling: boolean | undefined =
        useFlags()[FeatureFlagKey.NewBillingInterface]

    if (!hasAccessToNewBilling) {
        return null
    }

    return (
        <div className="full-width">
            <PageHeader title="Billing" />
            <SecondaryNavbar>
                <NavLink exact to={BILLING_BASE_PATH}>
                    Usage & Plans
                </NavLink>
                <NavLink to={BILLING_PAYMENT_PATH}>Payment Information</NavLink>
                <NavLink to={BILLING_PAYMENTS_HISTORY}>Payment History</NavLink>
            </SecondaryNavbar>
            <Container fluid className={css.mainContainer}>
                <Switch>
                    <Route exact path={BILLING_BASE_PATH}>
                        <UsageAndPlansView />
                    </Route>
                    <Route exact path={BILLING_PAYMENT_PATH}>
                        <PaymentInformationView />
                    </Route>
                    <Route exact path={BILLING_PAYMENTS_HISTORY}>
                        <PaymentsHistoryView />
                    </Route>
                </Switch>
            </Container>
        </div>
    )
}

export default BillingStartView
