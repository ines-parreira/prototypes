import { useGetSelfServiceConfigurations } from 'models/selfServiceConfiguration/queries'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'

export function useIsArticleRecommendationTableVisible() {
    const { enabledInStatistics } =
        useIsArticleRecommendationsEnabledWhileSunset()
    const { data: selfServiceConfigurations, isLoading } =
        useGetSelfServiceConfigurations()

    if (!enabledInStatistics) return false

    // Show optimistically while loading to avoid tab flickering
    if (isLoading) return true

    return (
        selfServiceConfigurations?.some(
            (config) => config.articleRecommendationHelpCenterId != null,
        ) ?? false
    )
}
