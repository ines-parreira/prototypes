import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useMemo} from 'react'
import {useLocation} from 'react-router-dom'
import {FeatureFlagKey} from 'config/featureFlags'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'
import {
    PaywallConfig,
    paywallConfigs as defaultPaywallConfigs,
} from 'config/paywalls'
import withStoreIntegration from 'pages/automate/common/utils/withStoreIntegrations'
import HeaderTitle from 'pages/common/components/HeaderTitle'
import PageHeader from 'pages/common/components/PageHeader'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import {AccountFeature} from 'state/currentAccount/types'
import AutomateOverviewV1 from 'pages/stats/AutomateOverviewV1'
import AutomateOverviewV2 from 'pages/stats/AutomateOverviewV2'
import SelfServiceStatsPagePaywallCustomCta from 'pages/stats/self-service/SelfServiceStatsPagePaywallCustomCta'
import {
    PAGE_TITLE_AUTOMATE_PAYWALL,
    PAGE_TITLE_OVERVIEW,
    ROUTE_AUTOMATE_OVERVIEW_V2_TMP,
} from 'pages/stats/self-service/constants'

export const AAO_TIPS_VISIBILITY_KEY = 'gorgias-aao-stats-tips-visibility'

export function AutomateOverview() {
    const isAutomateAnalyticsv2: boolean | undefined =
        useFlags()[FeatureFlagKey.ObservabilityAutomateAnalyticsv2]
    const {
        cleanStatsFilters: statsFilters,
        userTimezone,
        granularity,
    } = useAppSelector(getCleanStatsFiltersWithTimezone)

    const location = useLocation()
    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {channels, period} = statsFilters
        return {
            channels,
            period,
        }
    }, [statsFilters])

    if (
        isAutomateAnalyticsv2 ||
        location.pathname.endsWith(ROUTE_AUTOMATE_OVERVIEW_V2_TMP)
    ) {
        return (
            <AutomateOverviewV2
                filters={pageStatsFilters}
                timezone={userTimezone}
                granularity={granularity}
            />
        )
    }
    return (
        <AutomateOverviewV1
            filters={pageStatsFilters}
            timezone={userTimezone}
            granularity={granularity}
        />
    )
}

export default withFeaturePaywall(
    AccountFeature.AutomationSelfServiceStatistics,
    undefined,
    {
        [AccountFeature.AutomationSelfServiceStatistics]: {
            ...defaultPaywallConfigs[AccountFeature.AutomationAddonOverview],
            pageHeader: (
                <PageHeader
                    title={<HeaderTitle title={PAGE_TITLE_AUTOMATE_PAYWALL} />}
                />
            ),
            customCta: <SelfServiceStatsPagePaywallCustomCta />,
        } as PaywallConfig,
    }
)(withStoreIntegration(PAGE_TITLE_OVERVIEW, AutomateOverview))
