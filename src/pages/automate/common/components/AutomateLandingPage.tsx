import React, {useMemo} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import moment from 'moment'
import useCallbackRef from 'hooks/useCallbackRef'
import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'

import {FeatureFlagKey} from 'config/featureFlags'

import StatsPage from 'pages/stats/StatsPage'
import {StatsFilters} from 'models/stat/types'
import AutomateLandingPageDashboardV1 from './AutomateLandingPageDashboardV1'
import AutomateLandingPageDashboardV2 from './AutomateLandingPageDashboardV2'

const AutomateLandingPage = () => {
    const isAutomateAnalyticsv2: boolean | undefined =
        useFlags()[FeatureFlagKey.ObservabilityAutomateAnalyticsv2]

    const [checkListNode, setCheckListNode] = useCallbackRef()
    useInjectStyleToCandu(checkListNode)

    const filterDates = useMemo(() => {
        const nowLess28DaysDatetime = moment()
            .subtract(28, 'days')
            .startOf('day')
            .format()

        const nowDatetime = moment().endOf('day').format()

        return {
            nowDatetime,
            nowLess28DaysDatetime,
        }
    }, [])

    const {nowDatetime, nowLess28DaysDatetime} = filterDates

    const filters: StatsFilters = useMemo(
        () => ({
            period: {
                end_datetime: nowDatetime,
                start_datetime: nowLess28DaysDatetime,
            },
        }),
        [nowDatetime, nowLess28DaysDatetime]
    )

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
