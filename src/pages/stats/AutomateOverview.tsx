import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useMemo} from 'react'
import {useLocation} from 'react-router-dom'
import {FeatureFlagKey} from 'config/featureFlags'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'

import {periodToReportingGranularity} from 'utils/reporting'
import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'
import {getStatsFilters} from 'state/stats/selectors'
import {getTimezone} from 'state/currentUser/selectors'
import {
    PaywallConfig,
    paywallConfigs as defaultPaywallConfigs,
} from 'config/paywalls'
import withStoreIntegration from 'pages/automate/common/utils/withStoreIntegrations'
import HeaderTitle from 'pages/common/components/HeaderTitle'
import PageHeader from 'pages/common/components/PageHeader'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import {AccountFeature} from 'state/currentAccount/types'
import {DEFAULT_TIMEZONE} from './constants'
import AutomateOverviewV1 from './AutomateOverviewV1'
import AutomateOverviewV2 from './AutomateOverviewV2'
import SelfServiceStatsPagePaywallCustomCta from './self-service/SelfServiceStatsPagePaywallCustomCta'
import {
    PAGE_TITLE_AUTOMATE_PAYWALL,
    PAGE_TITLE_OVERVIEW,
    ROUTE_AUTOMATE_OVERVIEW_V2_TMP,
} from './self-service/constants'

export const AAO_TIPS_VISIBILITY_KEY = 'gorgias-aao-stats-tips-visibility'

export function AutomateOverview() {
    const isAutomateAnalyticsv2: boolean | undefined =
        useFlags()[FeatureFlagKey.ObservabilityAutomateAnalyticsv2]
    const statsFilters = useAppSelector(getStatsFilters)
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const location = useLocation()
    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {channels, period} = statsFilters
        return {
            channels,
            period: {
                start_datetime: period.start_datetime,
                end_datetime: period.end_datetime,
            },
        }
    }, [statsFilters])

    const requestStatsFilters = useCleanStatsFilters(pageStatsFilters)
    const granularity = periodToReportingGranularity(requestStatsFilters.period)

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
