import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { SearchTermsTable } from 'domains/reporting/pages/help-center/components/SearchTermsTable/SearchTermsTable'
import { useSelectedHelpCenter } from 'domains/reporting/pages/help-center/hooks/useSelectedHelpCenter'

export const SearchTermsTableChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { selectedHelpCenterDomain: helpCenterDomain } =
        useSelectedHelpCenter()
    return (
        <ChartCard
            title="Search terms with results"
            noPadding
            chartId={chartId}
            dashboard={dashboard}
        >
            {!helpCenterDomain ? (
                <NoDataAvailable
                    title="No data available"
                    description="Try adjusting filters to get results."
                    style={{ height: 448 }}
                />
            ) : (
                <SearchTermsTable helpCenterDomain={helpCenterDomain} />
            )}
        </ChartCard>
    )
}
