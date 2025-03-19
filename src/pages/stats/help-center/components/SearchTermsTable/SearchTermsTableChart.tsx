import ChartCard from 'pages/stats/ChartCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { SearchTermsTable } from 'pages/stats/help-center/components/SearchTermsTable/SearchTermsTable'
import { useSelectedHelpCenter } from 'pages/stats/help-center/hooks/useSelectedHelpCenter'
import { NoDataAvailable } from 'pages/stats/NoDataAvailable'

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
