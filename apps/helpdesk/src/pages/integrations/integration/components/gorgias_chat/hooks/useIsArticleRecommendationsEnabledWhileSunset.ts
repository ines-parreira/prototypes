import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { getCurrentAccountCreatedDatetime } from 'state/currentAccount/selectors'
import * as integrationsSelectors from 'state/integrations/selectors'

export const CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE = new Date(
    '2025-08-31T23:59:59Z',
)

// Chat "Article recommendation" is being sunsetted in favor of the "AI Agent".
// This hook is used to determine if the "Article recommendation" feature should be enabled in the UI.
// We still keep the feature:
// - If a merchant has any non-Shopify integration (BigCommerce, Magento) as AI Agent is not available for them
// - If a merchant has used the feature in the last month
// - If the feature flag is explicitly enabled for the user
// Note, for every new user, the feature will be disabled by default as they won't have any recent usage.
export function useIsArticleRecommendationsEnabledWhileSunset() {
    const hasNonShopifyIntegration =
        useAppSelector(
            integrationsSelectors.getIntegrationsByTypes([
                IntegrationType.BigCommerce,
                IntegrationType.Magento2,
            ]),
        ).length > 0

    const isNewMerchant =
        new Date(useAppSelector(getCurrentAccountCreatedDatetime)) >
        CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE

    // The usage will be taken into account in the next iteration
    // const hasArticleRecommendationForcedWithFF = useFlag(
    //     FeatureFlagKey.ChatArticleRecommendationsEnabled,
    //     false,
    // )
    // const [hasRecentUsage, setHasRecentUsage] = useState<boolean>(true)
    // const userTimezone = useAppSelector(getTimezone)
    //
    // useEffect(() => {
    //     if (hasArticleRecommendationForcedWithFF) {
    //         setHasRecentUsage(true)
    //         return
    //     }
    //
    //     async function checkArticleRecommendationUsage() {
    //         try {
    //             const data = await fetchRecommendedResourcesTimeSeries(
    //                 {
    //                     period: {
    //                         start_datetime: moment()
    //                             .subtract(1, 'month')
    //                             .startOf('day')
    //                             .format(),
    //                         end_datetime: moment().format(),
    //                     },
    //                 },
    //                 userTimezone || 'UTC',
    //                 ReportingGranularity.Month,
    //             )
    //
    //             // Check if there's any usage during the last month (sum of all values > 0)
    //             const totalUsage = data.reduce((sum, series) => {
    //                 return (
    //                     sum +
    //                     series.reduce(
    //                         (seriesSum, item) => seriesSum + item.value,
    //                         0,
    //                     )
    //                 )
    //             }, 0)
    //
    //             setHasRecentUsage(totalUsage > 0)
    //         } catch (error) {
    //             console.error(
    //                 'Error checking article recommendation usage:',
    //                 error,
    //             )
    //             // In case of error, default to the feature flag value
    //             setHasRecentUsage(true)
    //         }
    //     }
    //
    //     checkArticleRecommendationUsage()
    // }, [hasArticleRecommendationForcedWithFF, userTimezone])

    return {
        enabled: hasNonShopifyIntegration || !isNewMerchant,
    }
}
