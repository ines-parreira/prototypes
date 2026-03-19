import { Redirect, useParams } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import ReturnOrderFlowView from './ReturnOrderFlowView'

const ReturnOrderFlowViewContainer = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const { hasAccess } = useAiAgentAccess(shopName)

    if (!hasAccess) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <ReturnOrderFlowView />
}

export default ReturnOrderFlowViewContainer
