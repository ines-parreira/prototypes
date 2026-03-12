import type { Map } from 'immutable'

import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout'
import { useChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useChatPreviewPanel'

import { ArticleRecommendationCard } from './components/ArticleRecommendationCard/ArticleRecommendationCard'
import { useArticleRecommendation } from './hooks/useArticleRecommendation'

import css from './GorgiasAutomateChatIntegration.less'

type Props = {
    integration: Map<any, any>
}

export const GorgiasAutomateChatIntegrationRevamp = ({
    integration,
}: Props) => {
    useChatPreviewPanel()

    const {
        enabledInSettings,
        isArticleRecommendationEnabled,
        isDisabled,
        isLoading,
        showHelpCenterRequired,
        handleToggle,
    } = useArticleRecommendation({ integration })

    return (
        <GorgiasChatRevampLayout integration={integration}>
            <div className={css.cardsWrapper}>
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
        </GorgiasChatRevampLayout>
    )
}
