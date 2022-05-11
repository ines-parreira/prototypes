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
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/self-service/${integrationType}/${shopName}/preferences/order-management`}
                            >
                                {shopName}
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Report Issue</BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                <Button onClick={handleClickNewCase}>
                    <span className="icon material-icons">add</span> New Case
                </Button>
            </PageHeader>

            <Container fluid className={settingsCss.pageContainer}>
                <Row>
                    <Col>
                        <div className="mb-3">
                            <h4 className={css.reportIssuePolicyTitle}>
                                Report issue
                            </h4>
                            <p>
                                Update reasons for customers to report an issue
                                depending on order status.
                            </p>
                        </div>

                        <h5 className={css.casesTitle}>Cases</h5>
                        <p>
                            Customize reasons based on Shopify order and
                            fulfillment statuses. Cases are checked in the order
                            listed below.
                        </p>
                    </Col>
                </Row>
            </Container>

            <ReportIssueCasesList />
        </div>
    )
}

export default ReportIssuePolicyView
