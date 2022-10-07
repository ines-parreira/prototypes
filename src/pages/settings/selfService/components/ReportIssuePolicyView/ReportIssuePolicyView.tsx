import React, {ComponentType} from 'react'
import {Breadcrumb, BreadcrumbItem, Col, Container, Row} from 'reactstrap'
import {Link, useHistory, useRouteMatch} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import {GorgiasChatIntegrationSelfServicePaywall} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {getLoading} from 'state/ui/selfServiceConfigurations/selectors'
import Loader from 'pages/common/components/Loader/Loader'
import settingsCss from 'pages/settings/settings.less'

import SelfServicePreferencesNavbar from '../SelfServicePreferencesNavbar'
import BackButton from '../BackButton'
import ReportIssueCasesList from './components/ReportIssueCasesList'
import css from './ReportIssuePolicyView.less'

const ReportIssuePolicyView: ComponentType = () => {
    const {
        params: {shopName, integrationType},
    } = useRouteMatch<{shopName: string; integrationType: string}>()
    const history = useHistory()

    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const isLoading = useAppSelector(getLoading)

    const handleClickNewCase = () => {
        history.push(
            `/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue/new`
        )
    }

    if (!hasAutomationAddOn) {
        return <GorgiasChatIntegrationSelfServicePaywall />
    }

    if (isLoading) {
        return <Loader />
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/self-service">
                                Self-service
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>{shopName}</BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                <Button onClick={handleClickNewCase}>
                    <span className="icon material-icons">add</span> New Case
                </Button>
            </PageHeader>
            <SelfServicePreferencesNavbar />
            <Container fluid className={settingsCss.pageContainer}>
                <Row>
                    <Col>
                        <BackButton
                            path={`/app/settings/self-service/${integrationType}/${shopName}/preferences/order-management`}
                        >
                            Back to Order management flows
                        </BackButton>
                        <div className="mb-3">
                            <h4 className={css.reportIssuePolicyTitle}>
                                Report order issue
                            </h4>
                            <p>
                                Allow customers to report order issues directly
                                from <b>chat</b> and your <b>help center</b>.
                            </p>
                        </div>

                        <h5 className={css.casesTitle}>Order scenarios</h5>
                        <p>
                            Customize order scenarios and the corresponding
                            options to display to shoppers when reporting order
                            issues. Order scenarios apply in the sequence listed
                            below.
                        </p>
                    </Col>
                </Row>
            </Container>

            <ReportIssueCasesList />
        </div>
    )
}

export default ReportIssuePolicyView
