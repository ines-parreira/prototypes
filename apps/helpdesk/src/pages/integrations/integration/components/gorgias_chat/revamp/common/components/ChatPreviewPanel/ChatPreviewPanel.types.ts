import type {
    GorgiasChatPosition,
    GorgiasChatPreviewApplicationSettings,
} from 'models/integration/types'
import type {
    GorgiasChatPreviewOrdersOptions,
    GorgiasChatPreviewSelfServiceFlows,
    GorgiasChatWorkflowEntrypoint,
} from 'models/integration/types/gorgiasChat'

export type ChatPreviewPage =
    | 'homepage'
    | 'conversation'
    | 'orders'
    | 'track'
    | 'report'
    | 'reported-issue'

export type ChatPreviewPageOptions = {
    orderName?: string
    reasonKey?: string
    responseText?: string
    showHelpfulPrompt?: boolean
}

export type ChatPreviewBusinessHoursMode =
    | 'during-business-hours'
    | 'outside-business-hours'

export type SimulateConversationMessage = {
    text: string
    isHtml?: boolean
    fromAgent: boolean
    isBot: boolean
}

export type ChatPreviewPanelHandle = {
    displayPage: (
        page: ChatPreviewPage,
        options?: ChatPreviewPageOptions,
    ) => void
    updatePosition: (position: GorgiasChatPosition) => void
    updateSettings: (settings: GorgiasChatPreviewApplicationSettings) => void
    updateTexts: (texts: Record<string, string>) => void
    updatePreviewTexts: (texts: Record<string, string>) => void
    updateSSPTexts: (texts: Record<string, string>) => void
    closeChat: () => void
    openChat: () => void
    updateWorkflowEntryPoints: (
        workflowEntrypoints: GorgiasChatWorkflowEntrypoint[],
    ) => void
    updateOrderManagementFlows: (
        flows: GorgiasChatPreviewSelfServiceFlows,
    ) => void
    reloadPreview: () => void
    updatePreviewOrders: (options: GorgiasChatPreviewOrdersOptions) => void
    simulateConversation: (messages: SimulateConversationMessage[]) => void
    setConversationMessages: (messages: SimulateConversationMessage[]) => void
    simulateEmailCapture: () => void
    isLoaded: boolean
}
