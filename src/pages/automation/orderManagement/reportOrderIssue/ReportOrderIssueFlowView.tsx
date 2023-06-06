import React, {useState} from 'react'
import {Link, useHistory, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import Button from 'pages/common/components/button/Button'
import AutomationView from 'pages/automation/common/components/AutomationView'
import AutomationViewContent from 'pages/automation/common/components/AutomationViewContent'

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

    const handleCreateScenarioClick = () => {
        history.push(
            `/app/automation/shopify/${shopName}/order-management/report-issue/new`
        )
    }

    const isLoading = !selfServiceConfiguration

    return (
        <AutomationView
            title={
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link
                            to={`/app/automation/shopify/${shopName}/order-management`}
                        >
                            Order management flows
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>Report order issue</BreadcrumbItem>
                </Breadcrumb>
            }
            action={
                <Button onClick={handleCreateScenarioClick}>
                    Create Scenario
                </Button>
            }
            isLoading={isLoading}
        >
            <AutomationViewContent
                description="Customize scenarios and the corresponding options customers can select when reporting order issues."
                helpUrl="https://docs.gorgias.com/en-US/self-service-portal-statuses-81862"
                helpTitle="How to Customize The Report Order Issue Flow"
            >
                <div className={css.captionContainer}>
                    <i className="material-icons md-2">arrow_downward</i>
                    <span>Scenarios apply in the order below</span>
                </div>
                <ReportOrderIssueScenarioList
                    items={scenarios}
                    onHasHoveredItemChange={setHasHoveredScenario}
                    onReorder={handleScenariosUpdate}
                />
            </AutomationViewContent>
            <ReportOrderIssueFlowPreview
                hasHoveredScenario={hasHoveredScenario}
            />
        </AutomationView>
    )
}

export default ReportOrderIssueFlowView
