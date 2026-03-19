import { Redirect, useParams } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import CreateReportOrderIssueFlowScenarioView from './CreateReportOrderIssueFlowScenarioView'

const CreateReportOrderIssueFlowScenarioViewContainer = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const { hasAccess } = useAiAgentAccess(shopName)

    if (!hasAccess) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <CreateReportOrderIssueFlowScenarioView />
}

export default CreateReportOrderIssueFlowScenarioViewContainer
