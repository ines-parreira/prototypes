import { Redirect, useParams } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import EditReportOrderIssueFlowScenarioView from './EditReportOrderIssueFlowScenarioView'

const EditReportOrderIssueFlowScenarioViewContainer = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const { hasAccess } = useAiAgentAccess(shopName)

    if (!hasAccess) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <EditReportOrderIssueFlowScenarioView />
}

export default EditReportOrderIssueFlowScenarioViewContainer
