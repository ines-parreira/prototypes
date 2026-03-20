import { useParams } from 'react-router-dom'

import { AutomateFeatures } from 'pages/automate/common/types'
import { ArticleRecommendationCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ArticleRecommendationCard/ArticleRecommendationCard'
import { OrderManagementCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/OrderManagementCard/OrderManagementCard'

import { ConnectedChannelsEmptyView } from '../../../legacy/components/ConnectedChannelsEmptyView'
import { useArticleRecommendation } from '../../hooks/useArticleRecommendation'
import { useOrderManagement } from '../../hooks/useOrderManagement'

import css from './ConnectedChannelsChatView.less'

export const ConnectedChannelsChatView = () => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

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

    if (!hasChatChannels) {
        return (
            <ConnectedChannelsEmptyView view={AutomateFeatures.AutomateChat} />
        )
    }

    return (
        <div className={css.wrapper}>
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
