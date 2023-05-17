import React, {useState} from 'react'
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
import {generateBreadcrumbs} from '../../utils/generateBreadcrumbs'

const BillingStartView = () => {
    const hasAccessToNewBilling: boolean | undefined =
        useFlags()[FeatureFlagKey.NewBillingInterface]
    const [breadcrumbItems, setBreadcrumbItems] = useState<
        (JSX.Element | string)[]
    >([])

    if (!hasAccessToNewBilling) {
        return null
    }

    return (
        <div className="full-width">
            <PageHeader title={generateBreadcrumbs(breadcrumbItems)} />
            <SecondaryNavbar>
                <NavLink exact to={BILLING_BASE_PATH}>
                    Usage & Plans
                </NavLink>
                <NavLink to={BILLING_PAYMENT_PATH}>Payment Information</NavLink>
                <NavLink to={BILLING_PAYMENTS_HISTORY}>Payment History</NavLink>
            </SecondaryNavbar>
            <Container fluid>
                <Switch>
                    <Route exact path={BILLING_BASE_PATH}>
                        <UsageAndPlansView
                            setBreadcrumbItems={setBreadcrumbItems}
                        />
                    </Route>
                    <Route exact path={BILLING_PAYMENT_PATH}>
                        <PaymentInformationView
                            setBreadcrumbItems={setBreadcrumbItems}
                        />
                    </Route>
                    <Route exact path={BILLING_PAYMENTS_HISTORY}>
                        <PaymentsHistoryView
                            setBreadcrumbItems={setBreadcrumbItems}
                        />
                    </Route>
                </Switch>
            </Container>
        </div>
    )
}

export default BillingStartView
