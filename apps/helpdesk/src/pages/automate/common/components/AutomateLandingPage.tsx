import React, { useMemo } from 'react'

import { useCallbackRef } from '@repo/hooks'

import type { StatsFilters } from 'domains/reporting/models/stat/types'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import AutomateLandingPageDashboardV2 from 'pages/automate/common/components/AutomateLandingPageDashboardV2'
import { last28DaysStatsFilters } from 'pages/automate/common/utils/last28DaysStatsFilters'

import { AutomateLandingPageTopQuestions } from './TopQuestions/AutomateLandingPageTopQuestions'

/**
 * @deprecated This component is outdated and not used anymore. Do not add any new usage of this component.
 * @date 2025-10-02
 * @type automate-deprecation
 */
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
