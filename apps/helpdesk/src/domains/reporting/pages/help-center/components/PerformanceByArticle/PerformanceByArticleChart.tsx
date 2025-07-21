import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { PerformanceByArticle } from 'domains/reporting/pages/help-center/components/PerformanceByArticle/PerformanceByArticle'
import { useSelectedHelpCenter } from 'domains/reporting/pages/help-center/hooks/useSelectedHelpCenter'

export const PerformanceByArticleChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { selectedHelpCenterDomain: helpCenterDomain, helpCenterId } =
        useSelectedHelpCenter()

    return (
        <>
            {helpCenterDomain ? (
                <PerformanceByArticle
                    helpCenterDomain={helpCenterDomain}
                    helpCenterId={helpCenterId}
                    dashboard={dashboard}
                    chartId={chartId}
                />
            ) : (
                <NoDataAvailable
                    title="No data available"
                    description="Try adjusting filters to get results."
                    style={{ height: 1156 }}
                />
            )}
        </>
    )
}
