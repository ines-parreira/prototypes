import { useGridSize } from '@repo/hooks'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { ProductInsightsChart } from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsChartConfig'
import { ProductInsightsPlaceholderReportConfig } from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsReportConfig'

export const ProductInsightsReport = () => {
    const getGridCellSize = useGridSize()
    useCleanStatsFilters()

    return (
        <>
            <DashboardSection>
                <DashboardGridCell size={getGridCellSize(12)} className="pb-0">
                    <FiltersPanelWrapper
                        persistentFilters={
                            ProductInsightsPlaceholderReportConfig.reportFilters
                                .persistent
                        }
                        optionalFilters={
                            ProductInsightsPlaceholderReportConfig.reportFilters
                                .optional
                        }
                        filterSettingsOverrides={{
                            [FilterKey.Period]: {
                                initialSettings: {
                                    maxSpan: 365,
                                },
                            },
                        }}
                    />
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection title={'Product insights'}>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <DashboardComponent
                        chart={
                            ProductInsightsChart.TotalTicketSentimentOverTimeChart
                        }
                        config={ProductInsightsPlaceholderReportConfig}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <DashboardComponent
                        chart={ProductInsightsChart.TicketVolumeChart}
                        config={ProductInsightsPlaceholderReportConfig}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <DashboardComponent
                        chart={ProductInsightsChart.TopProductsPerAIIntentChart}
                        config={ProductInsightsPlaceholderReportConfig}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <DashboardComponent
                        chart={ProductInsightsChart.TopAIIntentsOverTimeChart}
                        config={ProductInsightsPlaceholderReportConfig}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(12)}>
                    <DashboardComponent
                        chart={ProductInsightsChart.ProductInsightsTableChart}
                        config={ProductInsightsPlaceholderReportConfig}
                    />
                </DashboardGridCell>
            </DashboardSection>
        </>
    )
}
