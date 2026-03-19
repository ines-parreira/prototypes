import React, { useState } from 'react'

import { Link, useHistory, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import AutomateView from 'pages/automate/common/components/AutomateView'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'
import { ORDER_MANAGEMENT } from 'pages/automate/common/components/constants'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import ReportOrderIssueScenarioList from './components/ReportOrderIssueScenarioList'
import useReportOrderIssueFlowScenarios from './hooks/useReportOrderIssueFlowScenarios'
import ReportOrderIssueFlowPreview from './ReportOrderIssueFlowPreview'

import css from './ReportOrderIssueFlowView.less'

const ReportOrderIssueFlowView = () => {
    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()
    const { scenarios, selfServiceConfiguration, handleScenariosUpdate } =
        useReportOrderIssueFlowScenarios(shopName)
    const [hasHoveredScenario, setHasHoveredScenario] = useState(false)
    const isAutomateSettings = useIsAutomateSettings()

    const handleCreateScenarioClick = () => {
        history.push(
            isAutomateSettings
                ? `/app/settings/order-management/shopify/${shopName}/report-issue/new`
                : `/app/automation/shopify/${shopName}/order-management/report-issue/new`,
        )
    }

    const isLoading = !selfServiceConfiguration

    return (
        <AutomateView
            title={
                isAutomateSettings ? undefined : (
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/automation/shopify/${shopName}/order-management`}
                            >
                                {ORDER_MANAGEMENT}
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Report order issue
                        </BreadcrumbItem>
                    </Breadcrumb>
                )
            }
            action={
                <Button onClick={handleCreateScenarioClick}>
                    Create Scenario
                </Button>
            }
            isLoading={isLoading}
        >
            <AutomateViewContent
                description="Customize scenarios and the corresponding options customers can select when reporting order issues."
                helpUrl="https://docs.gorgias.com/en-US/how-to-customize-the-report-order-issue-flow-81863"
                helpTitle="How to Customize The Report Order Issue Flow"
            >
                <div className={css.wrapper}>
                    <div className={css.captionContainer}>
                        <i className="material-icons md-2">arrow_downward</i>
                        <span>Scenarios apply in the order below</span>
                    </div>
                    {isAutomateSettings && (
                        <Button onClick={handleCreateScenarioClick}>
                            Create Scenario
                        </Button>
                    )}
                </div>
                <ReportOrderIssueScenarioList
                    items={scenarios}
                    onHasHoveredItemChange={setHasHoveredScenario}
                    onReorder={handleScenariosUpdate}
                />
            </AutomateViewContent>
            <ReportOrderIssueFlowPreview
                hasHoveredScenario={hasHoveredScenario}
            />
        </AutomateView>
    )
}

export default ReportOrderIssueFlowView
