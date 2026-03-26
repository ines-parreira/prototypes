import { Redirect, useParams } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import { CancelOrderFlowView } from './CancelOrderFlowView'

export const CancelOrderFlowViewContainerRevamp = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const { hasAccess } = useAiAgentAccess(shopName)

    if (!hasAccess) {
        return <Redirect to="/app/automation/order-management" />
    }

    return <CancelOrderFlowView />
}
