import React from 'react'

import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { PerformanceByArticle } from 'pages/stats/help-center/components/PerformanceByArticle/PerformanceByArticle'
import { useSelectedHelpCenter } from 'pages/stats/help-center/hooks/useSelectedHelpCenter'
import { NoDataAvailable } from 'pages/stats/NoDataAvailable'

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
