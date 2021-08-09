import React, {ComponentType} from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    Row,
    Button,
} from 'reactstrap'
import {Link, useRouteMatch} from 'react-router-dom'

import PageHeader from '../../../../common/components/PageHeader'

import ReportIssueCasesList from './components/ReportIssueCasesList'

import css from './ReportIssuePolicyView.less'

const ReportIssuePolicyView: ComponentType = () => {
    const {
        params: {shopName, integrationType},
    } = useRouteMatch<{shopName: string; integrationType: string}>()

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
                                to={`/app/settings/self-service/${integrationType}/${shopName}/preferences`}
                            >
                                {shopName}
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Report Issue</BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                <Button
                    tag={Link}
                    color="success"
                    to={`/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue/new`}
                >
                    <span className="icon material-icons">add</span> New Case
                </Button>
            </PageHeader>

            <Container fluid className="page-container">
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

                <Row>
                    <ReportIssueCasesList />
                </Row>
            </Container>
        </div>
    )
}

export default ReportIssuePolicyView
