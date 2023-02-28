import React, {useState} from 'react'
import {Link, useHistory, useParams} from 'react-router-dom'
import classnames from 'classnames'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'

import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import Button from 'pages/common/components/button/Button'
import useSelfServiceChannels from 'pages/automation/common/hooks/useSelfServiceChannels'
import {IntegrationType} from 'models/integration/constants'

import ReportOrderIssueScenarioList from './components/ReportOrderIssueScenarioList'
import useReportOrderIssueFlowScenarios from './hooks/useReportOrderIssueFlowScenarios'
import ReportOrderIssueFlowPreview from './ReportOrderIssueFlowPreview'

import css from './ReportOrderIssueFlowView.less'

const ReportOrderIssueFlowView = () => {
    const history = useHistory()
    const {shopName} = useParams<{shopName: string}>()
    const {scenarios, selfServiceConfiguration, handleScenariosUpdate} =
        useReportOrderIssueFlowScenarios(shopName)
    const [hasHoveredScenario, setHasHoveredScenario] = useState(false)
    const channels = useSelfServiceChannels(IntegrationType.Shopify, shopName)

    const handleCreateScenarioClick = () => {
        history.push(
            `/app/automation/shopify/${shopName}/order-management/report-issue/new`
        )
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/automation/shopify/${shopName}/order-management`}
                            >
                                Order management
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Report order issue
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                <Button onClick={handleCreateScenarioClick}>
                    Create Scenario
                </Button>
            </PageHeader>
            <Container
                fluid
                className={classnames({
                    [css.container]: Boolean(selfServiceConfiguration),
                })}
            >
                {!selfServiceConfiguration ? (
                    <Loader />
                ) : (
                    <>
                        <div>
                            <div className={css.descriptionContainer}>
                                <p className="mb-1">
                                    Customize scenarios and the corresponding
                                    options customers can select when reporting
                                    order issues.
                                </p>
                                <a
                                    href="https://docs.gorgias.com/en-US/self-service-portal-statuses-81862"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <i className="material-icons mr-2">
                                        menu_book
                                    </i>
                                    How to Customize The Report Order Issue Flow
                                </a>
                            </div>

                            <div className={css.captionContainer}>
                                <i className="material-icons md-2">
                                    arrow_downward
                                </i>
                                <span>Scenarios apply in the order below</span>
                            </div>

                            <ReportOrderIssueScenarioList
                                items={scenarios}
                                onHasHoveredItemChange={setHasHoveredScenario}
                                onReorder={handleScenariosUpdate}
                            />
                        </div>
                        <ReportOrderIssueFlowPreview
                            channels={channels}
                            hasHoveredScenario={hasHoveredScenario}
                        />
                    </>
                )}
            </Container>
        </div>
    )
}

export default ReportOrderIssueFlowView
