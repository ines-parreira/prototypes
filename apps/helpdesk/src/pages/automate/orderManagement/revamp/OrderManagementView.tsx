import { useEffect, useMemo } from 'react'

import type { GorgiasChatPreviewSelfServiceFlows } from 'models/integration/types/gorgiasChat'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { OrderManagementFlowsCard } from './components/OrderManagementFlowsCard/OrderManagementFlowsCard'
import { useOrderManagementFlows } from './components/OrderManagementFlowsCard/useOrderManagementFlows'

import css from './OrderManagementView.less'

export const OrderManagementViewRevamp = () => {
    const {
        isLoading,
        isUpdatePending,
        flows,
        handleFlowToggle,
        navigateToFlow,
    } = useOrderManagementFlows()

    const { displayPage, updateOrderManagementFlows } =
        useChatPreviewPanelContext()

    const flowsPayload = useMemo(
        (): GorgiasChatPreviewSelfServiceFlows => ({
            track_order:
                flows.find((f) => f.key === 'trackOrderPolicy')?.isEnabled ??
                false,
            cancel_order:
                flows.find((f) => f.key === 'cancelOrderPolicy')?.isEnabled ??
                false,
            return_order:
                flows.find((f) => f.key === 'returnOrderPolicy')?.isEnabled ??
                false,
            report_issue:
                flows.find((f) => f.key === 'reportIssuePolicy')?.isEnabled ??
                false,
        }),
        [flows],
    )

    useEffect(() => {
        displayPage('homepage')
    }, [displayPage])

    useEffect(() => {
        if (isLoading) return

        updateOrderManagementFlows(flowsPayload)
    }, [flowsPayload, isLoading, updateOrderManagementFlows])

    return (
        <div className={css.container}>
            <OrderManagementFlowsCard
                isLoading={isLoading}
                isUpdatePending={isUpdatePending}
                flows={flows}
                onFlowToggle={handleFlowToggle}
                onFlowClick={navigateToFlow}
            />
        </div>
    )
}
