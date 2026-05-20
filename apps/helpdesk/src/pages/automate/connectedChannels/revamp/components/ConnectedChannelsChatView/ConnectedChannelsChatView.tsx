import { useEffect, useMemo } from 'react'

import { useParams } from 'react-router-dom'

import { useListWorkflowEntryPoints } from 'models/workflows/queries'
import { AutomateFeatures } from 'pages/automate/common/types'
import { useConnectedChannelsContext } from 'pages/automate/connectedChannels/ConnectedChannelsContext'
import { ArticleRecommendationCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ArticleRecommendationCard/ArticleRecommendationCard'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { FlowsCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/FlowsCard/FlowsCard'
import { OrderManagementCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/OrderManagementCard/OrderManagementCard'

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

    const { channel: contextChannel } = useConnectedChannelsContext()

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
        primaryLanguage,
        workflowEntrypoints,
        channel,
        workflowConfigurations,
        automationSettingsWorkflows,
        handleFlowAdd,
        handleFlowRemove,
        handleFlowReorder,
    } = useFlows({
        shopName,
        shopType,
        selectedChannelId: contextChannel?.value.id,
    })

    const { updateWorkflowEntryPoints, displayPage, reloadPreview } =
        useChatPreviewPanelContext()

    const workflowIds = useMemo(
        () => automationSettingsWorkflows.map((flow) => flow.workflow_id),
        [automationSettingsWorkflows],
    )

    const { data: entrypointsLabels, isLoading: isEntrypointsLabelsLoading } =
        useListWorkflowEntryPoints({
            ids: workflowIds,
            language: primaryLanguage,
        })

    useEffect(() => {
        displayPage('homepage')
    }, [displayPage])

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

    const onOrderManagementChange = async (value: boolean) => {
        await handleOrderManagementToggle(value)
        reloadPreview()
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
                    onChange={onOrderManagementChange}
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
        </div>
    )
}
