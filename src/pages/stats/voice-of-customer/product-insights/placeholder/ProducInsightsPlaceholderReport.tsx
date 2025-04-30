import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import { ProductInsightsChart } from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'
import { ProductInsightsPlaceholderReportConfig } from 'pages/stats/voice-of-customer/product-insights/ProductInsightsReportConfig'

export const ProductInsightsPlaceholderReport = () => {
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
                            ProductInsightsChart.TotalProductSentimentOverTimeChartPlaceholder
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
                        chart={
                            ProductInsightsChart.TopProductsPerIntentChartPlaceholder
                        }
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
                        chart={
                            ProductInsightsChart.ProductInsightsTableChartPlaceholder
                        }
                        config={ProductInsightsPlaceholderReportConfig}
                    />
                </DashboardGridCell>
            </DashboardSection>
        </>
    )
}
