import type { RefObject } from 'react'
import { useCallback } from 'react'

import type {
    GorgiasChatPreviewOrdersOptions,
    GorgiasChatPreviewSelfServiceFlows,
    GorgiasChatWorkflowEntrypoint,
} from 'models/integration/types/gorgiasChat'

import type {
    ChatPreviewPage,
    ChatPreviewPageOptions,
    ChatPreviewPanelHandle,
} from '../ChatPreviewPanel'

type Controls = {
    displayPage: (
        page: ChatPreviewPage,
        options?: ChatPreviewPageOptions,
    ) => void
}

export const useSelfServiceActions = (
    panelRef: RefObject<ChatPreviewPanelHandle>,
    { displayPage }: Controls,
) => {
    const updateWorkflowEntryPoints = useCallback(
        (workflowEntryPoints: GorgiasChatWorkflowEntrypoint[]) => {
            displayPage('homepage')
            panelRef.current?.updateWorkflowEntryPoints(workflowEntryPoints)
        },
        [panelRef, displayPage],
    )

    const updateOrderManagementFlows = useCallback(
        (flows: GorgiasChatPreviewSelfServiceFlows) => {
            panelRef.current?.updateOrderManagementFlows(flows)
        },
        [panelRef],
    )

    const updatePreviewOrders = useCallback(
        (options: GorgiasChatPreviewOrdersOptions) => {
            panelRef.current?.updatePreviewOrders(options)
        },
        [panelRef],
    )

    return {
        updateWorkflowEntryPoints,
        updateOrderManagementFlows,
        updatePreviewOrders,
    }
}
