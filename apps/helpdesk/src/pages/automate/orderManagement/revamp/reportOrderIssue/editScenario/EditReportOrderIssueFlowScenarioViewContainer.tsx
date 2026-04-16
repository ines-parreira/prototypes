import { Redirect, useParams } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import { EditReportOrderIssueScenarioView } from './EditReportOrderIssueFlowScenarioView'

export const EditReportOrderIssueFlowScenarioViewContainerRevamp = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const { hasAccess } = useAiAgentAccess(shopName)

    if (!hasAccess) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <EditReportOrderIssueScenarioView />
}
