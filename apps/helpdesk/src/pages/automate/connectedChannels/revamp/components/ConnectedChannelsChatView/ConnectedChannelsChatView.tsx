import { useState } from 'react'

import { useParams } from 'react-router-dom'

import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { AutomateFeatures } from 'pages/automate/common/types'
import { ArticleRecommendationCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ArticleRecommendationCard/ArticleRecommendationCard'
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

    const [selectedChannelId] = useState<number | undefined>(
        () => chatChannels[0]?.value.id,
    )

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
        </div>
    )
}
