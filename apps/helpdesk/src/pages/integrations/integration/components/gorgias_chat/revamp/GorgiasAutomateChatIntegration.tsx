import { useState } from 'react'

import type { Map } from 'immutable'

import type { GorgiasChatIntegration } from 'models/integration/types'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import { AutomateFeatures } from 'pages/automate/common/types'
import { FlowsCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/FlowsCard/FlowsCard'
import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout'
import { useFlows } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useFlows'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { ArticleRecommendationCard } from './components/ArticleRecommendationCard/ArticleRecommendationCard'
import { ConnectedChannelsEmptyView } from './components/ConnectedChannelsEmptyView/ConnectedChannelsEmptyView'
import type { Workflow } from './components/FlowsCard/types'
import { OrderManagementCard } from './components/OrderManagementCard/OrderManagementCard'
import { useArticleRecommendation } from './hooks/useArticleRecommendation'
import { useOrderManagement } from './hooks/useOrderManagement'

import css from './GorgiasAutomateChatIntegration.less'

type Props = {
    integration: Map<any, any>
}

export const GorgiasAutomateChatIntegrationRevamp = ({
    integration,
}: Props) => {
    const { isConnected } = useStoreIntegration(integration)
    const gorgiasChatIntegration = integration.toJS() as GorgiasChatIntegration
    const appId = gorgiasChatIntegration?.meta?.app_id

    const {
        applicationsAutomationSettings,
        isUpdatePending: isSaving,
        handleChatApplicationAutomationSettingsUpdate,
    } = useApplicationsAutomationSettings(appId ? [appId] : [])

    const serverSettings = appId
        ? applicationsAutomationSettings?.[appId]
        : undefined

    const [pendingOrderManagement, setPendingOrderManagement] = useState<
        boolean | null
    >(null)
    const [pendingArticleRecommendation, setPendingArticleRecommendation] =
        useState<boolean | null>(null)
    const [pendingFlows, setPendingFlows] = useState<Workflow[] | null>(null)

    const {
        enabledInSettings: articleRecommendationEnabledInSettings,
        isArticleRecommendationEnabled: serverArticleRecommendationEnabled,
        isDisabled: isArticleRecommendationDisabled,
        isLoading: isArticleRecommendationLoading,
        showHelpCenterRequired,
    } = useArticleRecommendation({ integration })

    const {
        enabledInSettings: orderManagementEnabledInSettings,
        isOrderManagementEnabled: serverOrderManagementEnabled,
        isDisabled: isOrderManagementDisabled,
        isLoading: isOrderManagementLoading,
        showStoreRequired,
        orderManagementUrl,
    } = useOrderManagement({ integration })

    const {
        isLoading: isFlowsLoading,
        shopName,
        shopType,
        channel,
        primaryLanguage,
        workflowEntrypoints,
        workflowConfigurations,
        automationSettingsWorkflows,
    } = useFlows({ integration })

    const handleFlowsChange = (updatedWorkflows: Workflow[]) => {
        setPendingFlows(updatedWorkflows)
    }

    const isOrderManagementEnabled =
        pendingOrderManagement ?? serverOrderManagementEnabled
    const isArticleRecommendationEnabled =
        pendingArticleRecommendation ?? serverArticleRecommendationEnabled

    const isSaveDisabled =
        pendingOrderManagement === null &&
        pendingArticleRecommendation === null &&
        pendingFlows === null

    const handleSave = async () => {
        if (!serverSettings) return

        await handleChatApplicationAutomationSettingsUpdate({
            ...serverSettings,
            ...(pendingOrderManagement !== null && {
                orderManagement: { enabled: pendingOrderManagement },
            }),
            ...(pendingArticleRecommendation !== null && {
                articleRecommendation: {
                    enabled: pendingArticleRecommendation,
                },
            }),
            ...(pendingFlows !== null && {
                workflows: {
                    ...serverSettings.workflows,
                    entrypoints: pendingFlows,
                },
            }),
        })

        setPendingOrderManagement(null)
        setPendingArticleRecommendation(null)
        setPendingFlows(null)
    }

    if (!isConnected) {
        return (
            <GorgiasChatRevampLayout integration={integration}>
                <ConnectedChannelsEmptyView
                    view={AutomateFeatures.AutomateChat}
                />
            </GorgiasChatRevampLayout>
        )
    }

    return (
        <GorgiasChatRevampLayout
            integration={integration}
            onSave={handleSave}
            isSaveDisabled={isSaveDisabled}
            isSaving={isSaving}
        >
            <div className={css.cardsWrapper}>
                <FlowsCard
                    isLoading={isFlowsLoading}
                    shopName={shopName}
                    shopType={shopType}
                    channel={channel}
                    primaryLanguage={primaryLanguage}
                    workflowEntrypoints={workflowEntrypoints}
                    workflowConfigurations={workflowConfigurations}
                    automationSettingsWorkflows={
                        pendingFlows ?? automationSettingsWorkflows
                    }
                    onChange={handleFlowsChange}
                />
                {orderManagementEnabledInSettings && (
                    <OrderManagementCard
                        isEnabled={isOrderManagementEnabled}
                        isDisabled={isOrderManagementDisabled}
                        isLoading={isOrderManagementLoading}
                        showStoreRequired={showStoreRequired}
                        orderManagementUrl={orderManagementUrl}
                        onChange={setPendingOrderManagement}
                    />
                )}
                {articleRecommendationEnabledInSettings && (
                    <ArticleRecommendationCard
                        isEnabled={isArticleRecommendationEnabled}
                        isDisabled={isArticleRecommendationDisabled}
                        isLoading={isArticleRecommendationLoading}
                        showHelpCenterRequired={showHelpCenterRequired}
                        onChange={setPendingArticleRecommendation}
                    />
                )}
            </div>
        </GorgiasChatRevampLayout>
    )
}
