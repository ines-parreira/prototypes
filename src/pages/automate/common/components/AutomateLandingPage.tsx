import React, {useMemo} from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'
import useCallbackRef from 'hooks/useCallbackRef'
import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'

import {FeatureFlagKey} from 'config/featureFlags'

import StatsPage from 'pages/stats/StatsPage'
import {StatsFilters} from 'models/stat/types'
import {last28DaysStatsFilters} from 'pages/automate/common/utils/last28DaysStatsFilters'
import AutomateLandingPageDashboardV2 from 'pages/automate/common/components/AutomateLandingPageDashboardV2'
import {AutomateLandingPageTopQuestions} from './TopQuestions/AutomateLandingPageTopQuestions'

const AutomateLandingPage = () => {
    const isImprovedNavigationEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.ImprovedAutomateNavigation]

    const isAutomateTopQuestionsEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.ObservabilityAutomateTopQuestions]

    const [checkListNode, setCheckListNode] = useCallbackRef()
    useInjectStyleToCandu(checkListNode)

    const filters: StatsFilters = useMemo(last28DaysStatsFilters, [])

    return (
        <StatsPage
            title={isImprovedNavigationEnabled ? 'Overview' : 'Automate'}
            headerCanduId="header-my-automate"
        >
            <AutomateLandingPageDashboardV2
                filters={filters}
                isAutomateTopQuestionsEnabled={
                    isAutomateTopQuestionsEnabled === true
                }
            />

            {isAutomateTopQuestionsEnabled && (
                <AutomateLandingPageTopQuestions />
            )}

            <section
                data-candu-id="automate-landing-page-checklist"
                ref={setCheckListNode}
            />
        </StatsPage>
    )
}
export default AutomateLandingPage
