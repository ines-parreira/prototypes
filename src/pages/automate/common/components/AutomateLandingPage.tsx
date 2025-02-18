import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import useCallbackRef from 'hooks/useCallbackRef'

import {StatsFilters} from 'models/stat/types'
import AutomateLandingPageDashboardV2 from 'pages/automate/common/components/AutomateLandingPageDashboardV2'
import {last28DaysStatsFilters} from 'pages/automate/common/utils/last28DaysStatsFilters'
import StatsPage from 'pages/stats/StatsPage'

import {useDisplayAiAgentMovedBanner} from '../hooks/useDisplayAiAgentMovedBanner'
import {AiAgentMovedBanner} from './AiAgentMovedBanner'
import {AutomateLandingPageTopQuestions} from './TopQuestions/AutomateLandingPageTopQuestions'

const AutomateLandingPage = () => {
    const displayAiAgentMovedBanner = useDisplayAiAgentMovedBanner()
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
            banner={displayAiAgentMovedBanner && <AiAgentMovedBanner />}
        >
            <AutomateLandingPageDashboardV2
                filters={filters}
                isAutomateTopQuestionsEnabled={!!isAutomateTopQuestionsEnabled}
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
