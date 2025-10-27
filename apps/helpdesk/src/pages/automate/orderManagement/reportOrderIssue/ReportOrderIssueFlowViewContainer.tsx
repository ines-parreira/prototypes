import { Redirect, useParams } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import ReportOrderIssueFlowView from './ReportOrderIssueFlowView'

const ReportOrderIssueFlowViewContainer = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const { hasAccess } = useAiAgentAccess(shopName)

    if (!hasAccess) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <ReportOrderIssueFlowView />
}

export default ReportOrderIssueFlowViewContainer
