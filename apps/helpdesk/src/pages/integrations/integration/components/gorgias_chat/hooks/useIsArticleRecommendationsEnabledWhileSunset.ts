import { useEffect, useState } from 'react'

import moment from 'moment'

import { FeatureFlagKey } from 'config/featureFlags'
import useFlag from 'core/flags/hooks/useFlag'
import { fetchRecommendedResourcesTimeSeries } from 'domains/reporting/hooks/automate/timeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import useAppSelector from 'hooks/useAppSelector'
import { getTimezone } from 'state/currentUser/selectors'

// This hook is used to determine if article recommendations are enabled in the Gorgias chat integration.
// We currently sunset this feature, so it will be gradually disabled in the future.
// For now, new integrations will not have this feature enabled.
// Also, integrations that are not using article recommendations will not have this visible in the UI.
export function useIsArticleRecommendationsEnabledWhileSunset() {
    const isArticleRecommendationForced =
        // we force the feature to be enabled
        useFlag(FeatureFlagKey.ChatArticleRecommendationsEnabled, true)

    const [hasRecentUsage, setHasRecentUsage] = useState<boolean>(true)
    const userTimezone = useAppSelector(getTimezone)

    useEffect(() => {
        if (isArticleRecommendationForced) {
            setHasRecentUsage(true)
            return
        }

        async function checkArticleRecommendationUsage() {
            try {
                const data = await fetchRecommendedResourcesTimeSeries(
                    {
                        period: {
                            start_datetime: moment()
                                .subtract(1, 'month')
                                .startOf('day')
                                .format(),
                            end_datetime: moment().format(),
                        },
                    },
                    userTimezone || 'UTC',
                    ReportingGranularity.Month,
                )

                // Check if there's any usage during the last month (sum of all values > 0)
                const totalUsage = data.reduce((sum, series) => {
                    return (
                        sum +
                        series.reduce(
                            (seriesSum, item) => seriesSum + item.value,
                            0,
                        )
                    )
                }, 0)

                setHasRecentUsage(totalUsage > 0)
            } catch (error) {
                console.error(
                    'Error checking article recommendation usage:',
                    error,
                )
                // In case of error, default to the feature flag value
                setHasRecentUsage(true)
            }
        }

        checkArticleRecommendationUsage()
    }, [isArticleRecommendationForced, userTimezone])

    return {
        enabled: isArticleRecommendationForced || hasRecentUsage,
    }
}
