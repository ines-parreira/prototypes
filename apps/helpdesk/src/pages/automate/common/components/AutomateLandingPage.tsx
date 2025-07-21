import React, { useMemo } from 'react'

import { StatsFilters } from 'domains/reporting/models/stat/types'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import useCallbackRef from 'hooks/useCallbackRef'
import AutomateLandingPageDashboardV2 from 'pages/automate/common/components/AutomateLandingPageDashboardV2'
import { last28DaysStatsFilters } from 'pages/automate/common/utils/last28DaysStatsFilters'

import { AutomateLandingPageTopQuestions } from './TopQuestions/AutomateLandingPageTopQuestions'

const AutomateLandingPage = () => {
    const [checkListNode, setCheckListNode] = useCallbackRef()
    useInjectStyleToCandu(checkListNode)

    const filters: StatsFilters = useMemo(last28DaysStatsFilters, [])

    return (
        <StatsPage title="Overview" headerCanduId="header-my-automate">
            <AutomateLandingPageDashboardV2 filters={filters} />

            <AutomateLandingPageTopQuestions />

            <section
                data-candu-id="automate-landing-page-checklist"
                ref={setCheckListNode}
            />
        </StatsPage>
    )
}
export default AutomateLandingPage
