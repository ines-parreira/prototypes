import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import { useGridSize } from 'hooks/useGridSize'
import { Period } from 'models/stat/types'
import { HintTooltip } from 'pages/stats/common/HintTooltip'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import { PeriodShortcutSelector } from 'pages/stats/voice-of-customer/TrendOverview/PeriodShortcutSelector'
import { ProductHeader } from 'pages/stats/voice-of-customer/TrendOverview/ProductHeader'
import { TrendOverviewChart } from 'pages/stats/voice-of-customer/TrendOverview/TrendOverviewChartConfig'
import css from 'pages/stats/voice-of-customer/TrendOverview/TrendOverviewReport.less'
import { TrendOverviewReportConfig } from 'pages/stats/voice-of-customer/TrendOverview/TrendOverviewReportConfig'
import { getSidePanelProduct } from 'state/ui/stats/sidePanelSlice'

const FEEDBACK_TRENDS_SECTION_LABEL = 'Feedback trends'
const FEEDBACK_TRENDS_SECTION_TOOLTIP =
    'Top insights on products based on ticket quantity. Delta shows change in ticket volume from'

const SectionTitle = ({ period }: { period: Period }) => {
    return (
        <div className={css.titleContainer}>
            <div className={css.title}>
                <span>{FEEDBACK_TRENDS_SECTION_LABEL}</span>
                <HintTooltip
                    title={`${FEEDBACK_TRENDS_SECTION_TOOLTIP} ${period.start_datetime} - ${period.end_datetime}`}
                />
            </div>
            <PeriodShortcutSelector />
        </div>
    )
}

export const TrendOverviewReport = () => {
    const getGridCellSize = useGridSize()
    const { cleanStatsFilters } = useStatsFilters()
    const product = useAppSelector(getSidePanelProduct)

    return (
        <>
            {product && <ProductHeader product={product} />}
            <DashboardSection className={css.titleSection}>
                <DashboardGridCell size={getGridCellSize(12)}>
                    <SectionTitle period={cleanStatsFilters.period} />
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection>
                <DashboardGridCell size={getGridCellSize(12)}>
                    <DashboardComponent
                        chart={
                            TrendOverviewChart.TopAIIntentsForProductOverTimeChart
                        }
                        config={TrendOverviewReportConfig}
                    />
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <DashboardComponent
                        chart={
                            TrendOverviewChart.PositiveSentimentsPerProductKpiChart
                        }
                        config={TrendOverviewReportConfig}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <DashboardComponent
                        chart={
                            TrendOverviewChart.NegativeSentimentsPerProductKpiChart
                        }
                        config={TrendOverviewReportConfig}
                    />
                </DashboardGridCell>
            </DashboardSection>
        </>
    )
}
