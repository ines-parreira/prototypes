import { Redirect, useParams } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import { CreateReportOrderIssueScenarioView } from './CreateReportOrderIssueFlowScenarioView'

export const CreateReportOrderIssueFlowScenarioViewContainerRevamp = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const { hasAccess } = useAiAgentAccess(shopName)

    if (!hasAccess) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <CreateReportOrderIssueScenarioView />
}
