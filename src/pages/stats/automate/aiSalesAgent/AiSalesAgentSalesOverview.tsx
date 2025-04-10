import React from 'react'

import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import AiSalesAgentOverviewDownloadButton from 'pages/stats/automate/aiSalesAgent/AiSalesAgentOverviewDownloadButton'
import { PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW } from 'pages/stats/automate/aiSalesAgent/constants'
import StatsPage from 'pages/stats/common/layout/StatsPage'

import SalesOverview from './components/SalesOverview'

const AiSalesAgentSalesOverview = () => {
    useCleanStatsFilters()

    return (
        <StatsPage
            title={PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW}
            titleExtra={<AiSalesAgentOverviewDownloadButton />}
        >
            <SalesOverview />
        </StatsPage>
    )
}

export default AiSalesAgentSalesOverview
