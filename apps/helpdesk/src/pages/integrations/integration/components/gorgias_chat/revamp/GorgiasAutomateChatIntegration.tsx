import type { Map } from 'immutable'

import { AutomateFeatures } from 'pages/automate/common/types'
import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { ArticleRecommendationCard } from './components/ArticleRecommendationCard/ArticleRecommendationCard'
import { ConnectedChannelsEmptyView } from './components/ConnectedChannelsEmptyView/ConnectedChannelsEmptyView'
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

    const {
        enabledInSettings: articleRecommendationEnabledInSettings,
        isArticleRecommendationEnabled,
        isDisabled: isArticleRecommendationDisabled,
        isLoading: isArticleRecommendationLoading,
        showHelpCenterRequired,
        handleToggle: handleArticleRecommendationToggle,
    } = useArticleRecommendation({ integration })

    const {
        enabledInSettings: orderManagementEnabledInSettings,
        isOrderManagementEnabled,
        isDisabled: isOrderManagementDisabled,
        isLoading: isOrderManagementLoading,
        showStoreRequired,
        orderManagementUrl,
        handleToggle: handleOrderManagementToggle,
    } = useOrderManagement({ integration })

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
        <GorgiasChatRevampLayout integration={integration}>
            <div className={css.cardsWrapper}>
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
        </GorgiasChatRevampLayout>
    )
}
