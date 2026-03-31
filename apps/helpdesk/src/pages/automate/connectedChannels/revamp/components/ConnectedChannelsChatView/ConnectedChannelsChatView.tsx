import { useEffect, useMemo, useState } from 'react'

import { useParams } from 'react-router-dom'

import type { LANGUAGE } from 'constants/languages'
import { useListWorkflowEntryPoints } from 'models/workflows/queries'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { AutomateFeatures } from 'pages/automate/common/types'
import { ChatChannelSelector } from 'pages/automate/connectedChannels/revamp/components/ChatChannelSelector/ChatChannelSelector'
import { ArticleRecommendationCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ArticleRecommendationCard/ArticleRecommendationCard'
import { useChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { FlowsCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/FlowsCard/FlowsCard'
import { OrderManagementCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/OrderManagementCard/OrderManagementCard'

import { ConnectedChannelsEmptyView } from '../../../legacy/components/ConnectedChannelsEmptyView'
import { useArticleRecommendation } from '../../hooks/useArticleRecommendation'
import { useFlows } from '../../hooks/useFlows'
import { useOrderManagement } from '../../hooks/useOrderManagement'

import css from './ConnectedChannelsChatView.less'

export const ConnectedChannelsChatView = () => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const [selectedChannelId, setSelectedChannelId] = useState<
        number | undefined
    >(() => chatChannels[0]?.value.id)

    const selectedChannel =
        chatChannels.find((c) => c.value.id === selectedChannelId) ??
        chatChannels[0]

    const appId = selectedChannel?.value.meta.app_id ?? null

    const selectedChannelLanguage = useMemo(() => {
        const primaryLanguage: LANGUAGE | undefined =
            selectedChannel?.value?.meta?.languages?.find((lang) => {
                return lang.primary === true
            })?.language

        return primaryLanguage
    }, [selectedChannel])

    const {
        hasChatChannels,
        enabledInSettings: articleRecommendationEnabledInSettings,
        isArticleRecommendationEnabled,
        isDisabled: isArticleRecommendationDisabled,
        isLoading: isArticleRecommendationLoading,
        showHelpCenterRequired,
        handleToggle: handleArticleRecommendationToggle,
    } = useArticleRecommendation({ shopName, shopType })

    const {
        enabledInSettings: orderManagementEnabledInSettings,
        isOrderManagementEnabled,
        isDisabled: isOrderManagementDisabled,
        isLoading: isOrderManagementLoading,
        showStoreRequired,
        orderManagementUrl,
        handleToggle: handleOrderManagementToggle,
    } = useOrderManagement({ shopName, shopType })

    const {
        isLoading: isFlowsLoading,
        channel,
        primaryLanguage,
        workflowEntrypoints,
        workflowConfigurations,
        automationSettingsWorkflows,
        handleFlowAdd,
        handleFlowRemove,
        handleFlowReorder,
    } = useFlows({ shopName, shopType, selectedChannelId })

    const PreviewPanelHeaderActions = useMemo(() => {
        return chatChannels.length > 0 ? (
            <ChatChannelSelector
                chatChannels={chatChannels}
                selectedChannelId={selectedChannelId}
                onSelect={setSelectedChannelId}
            />
        ) : undefined
    }, [selectedChannelId, chatChannels])

    const { showPreviewPanel, chatPreviewPortal, updateWorkflowEntryPoints } =
        useChatPreviewPanel(PreviewPanelHeaderActions, selectedChannelLanguage)

    useEffect(() => {
        showPreviewPanel(appId)
    }, [showPreviewPanel, appId])

    const { data: entrypointsLabels, isLoading: isEntrypointsLabelsLoading } =
        useListWorkflowEntryPoints({
            ids: (automationSettingsWorkflows || []).map(
                (flow) => flow.workflow_id,
            ),
            language: primaryLanguage,
        })

    useEffect(() => {
        if (!isEntrypointsLabelsLoading && !isFlowsLoading) {
            const workflowEntryPoints = automationSettingsWorkflows
                .map((flow) => {
                    return {
                        workflow_id: flow.workflow_id,
                        language: primaryLanguage,
                        label: entrypointsLabels?.[flow.workflow_id],
                    }
                })
                .filter((flow) => flow.label)

            updateWorkflowEntryPoints(workflowEntryPoints)
        }
    }, [
        isFlowsLoading,
        primaryLanguage,
        entrypointsLabels,
        isEntrypointsLabelsLoading,
        updateWorkflowEntryPoints,
        automationSettingsWorkflows,
    ])

    if (!hasChatChannels) {
        return (
            <ConnectedChannelsEmptyView view={AutomateFeatures.AutomateChat} />
        )
    }

    return (
        <div className={css.wrapper}>
            {channel && (
                <FlowsCard
                    isLoading={isFlowsLoading}
                    shopName={shopName}
                    shopType={shopType}
                    channel={channel}
                    primaryLanguage={primaryLanguage}
                    workflowEntrypoints={workflowEntrypoints}
                    workflowConfigurations={workflowConfigurations}
                    automationSettingsWorkflows={automationSettingsWorkflows}
                    onAdd={handleFlowAdd}
                    onRemove={handleFlowRemove}
                    onReorder={handleFlowReorder}
                />
            )}
            {orderManagementEnabledInSettings && (
                <OrderManagementCard
                    isEnabled={isOrderManagementEnabled}
                    isDisabled={isOrderManagementDisabled}
                    isLoading={isOrderManagementLoading}
                    showStoreRequired={showStoreRequired}
                    orderManagementUrl={orderManagementUrl}
                    onChange={handleOrderManagementToggle}
                />
            )}
            {articleRecommendationEnabledInSettings && (
                <ArticleRecommendationCard
                    isEnabled={isArticleRecommendationEnabled}
                    isDisabled={isArticleRecommendationDisabled}
                    isLoading={isArticleRecommendationLoading}
                    showHelpCenterRequired={showHelpCenterRequired}
                    onChange={handleArticleRecommendationToggle}
                />
            )}
            {chatPreviewPortal}
        </div>
    )
}
