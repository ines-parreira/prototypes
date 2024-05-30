import React, {useMemo} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import useCallbackRef from 'hooks/useCallbackRef'
import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'

import {FeatureFlagKey} from 'config/featureFlags'

import StatsPage from 'pages/stats/StatsPage'
import {StatsFilters} from 'models/stat/types'
import {last28DaysStatsFilters} from 'pages/automate/common/utils/last28DaysStatsFilters'
import AutomateLandingPageDashboardV1 from 'pages/automate/common/components/AutomateLandingPageDashboardV1'
import AutomateLandingPageDashboardV2 from 'pages/automate/common/components/AutomateLandingPageDashboardV2'

const AutomateLandingPage = () => {
    const isAutomateAnalyticsv2: boolean | undefined =
        useFlags()[FeatureFlagKey.ObservabilityAutomateAnalyticsv2]

    const [checkListNode, setCheckListNode] = useCallbackRef()
    useInjectStyleToCandu(checkListNode)

    const filters: StatsFilters = useMemo(last28DaysStatsFilters, [])

    return (
        <StatsPage title="Automate" headerCanduId="header-my-automate">
            {isAutomateAnalyticsv2 ? (
                <AutomateLandingPageDashboardV2 filters={filters} />
            ) : (
                <AutomateLandingPageDashboardV1 filters={filters} />
            )}

            <section
                data-candu-id="automate-landing-page-checklist"
                ref={setCheckListNode}
            />
        </StatsPage>
    )
}
export default AutomateLandingPage
