import { useParams } from 'react-router-dom'

import { ArticleRecommendationCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ArticleRecommendationCard/ArticleRecommendationCard'

import { useArticleRecommendation } from '../../hooks/useArticleRecommendation'

import css from './ConnectedChannelsChatView.less'

export const ConnectedChannelsChatView = () => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

    const {
        enabledInSettings,
        isArticleRecommendationEnabled,
        isDisabled,
        isLoading,
        showHelpCenterRequired,
        handleToggle,
    } = useArticleRecommendation({ shopName, shopType })

    return (
        <div className={css.wrapper}>
            {enabledInSettings && (
                <ArticleRecommendationCard
                    isEnabled={isArticleRecommendationEnabled}
                    isDisabled={isDisabled}
                    isLoading={isLoading}
                    showHelpCenterRequired={showHelpCenterRequired}
                    onChange={handleToggle}
                />
            )}
        </div>
    )
}
