import { useEffectOnce } from '@repo/hooks'
import { getPreviousUrl } from '@repo/routing'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import AiSalesAgentOverviewDownloadButton from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentOverviewDownloadButton'
import SalesOverview from 'domains/reporting/pages/automate/aiSalesAgent/components/SalesOverview'
import { PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { useAiAgentAnalyticsDashboardTracking } from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'
import { STATS_ROUTES } from 'routes/constants'

const AiSalesAgentSalesOverview = () => {
    useCleanStatsFilters()
    const { onAnalyticsReportViewed } = useAiAgentAnalyticsDashboardTracking()

    useEffectOnce(() => {
        const previousUrl = getPreviousUrl()
        const previousReport = previousUrl?.split('/app/')[1] ?? '-'

        onAnalyticsReportViewed({
            reportName: STATS_ROUTES.AI_SALES_AGENT_OVERVIEW,
            previousReport,
        })
    })

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
