import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import AiSalesAgentOverviewDownloadButton from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentOverviewDownloadButton'
import SalesOverview from 'domains/reporting/pages/automate/aiSalesAgent/components/SalesOverview'
import { PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'

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
