import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useGridSize } from 'hooks/useGridSize'
import { Period } from 'models/stat/types'
import { HintTooltip } from 'pages/stats/common/HintTooltip'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import { PeriodShortcutSelector } from 'pages/stats/voice-of-customer/TrendOverview/PeriodShortcutSelector'
import { TrendOverviewChart } from 'pages/stats/voice-of-customer/TrendOverview/TrendOverviewChartConfig'
import css from 'pages/stats/voice-of-customer/TrendOverview/TrendOverviewReport.less'
import { TrendOverviewReportConfig } from 'pages/stats/voice-of-customer/TrendOverview/TrendOverviewReportConfig'
import { formatDateRange } from 'pages/stats/voice-of-customer/utils'

const FEEDBACK_TRENDS_SECTION_LABEL = 'Feedback trends'
const FEEDBACK_TRENDS_SECTION_TOOLTIP =
    'Top insights on products based on ticket quantity. Delta shows change in ticket volume from'

const SectionTitle = ({
    period,
    timezone,
}: {
    period: Period
    timezone: string
}) => {
    const formattedPeriod = formatDateRange(
        period.start_datetime,
        period.end_datetime,
        timezone,
    )

    return (
        <div className={css.titleContainer}>
            <div className={css.title}>
                <span>{FEEDBACK_TRENDS_SECTION_LABEL}</span>
                <HintTooltip
                    title={`${FEEDBACK_TRENDS_SECTION_TOOLTIP} ${formattedPeriod}`}
                />
            </div>
            <PeriodShortcutSelector />
        </div>
    )
}

export const TrendOverviewReport = () => {
    const getGridCellSize = useGridSize()
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    return (
        <>
            <DashboardSection className={css.titleSection}>
                <DashboardGridCell size={getGridCellSize(12)}>
                    <SectionTitle
                        period={cleanStatsFilters.period}
                        timezone={userTimezone}
                    />
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
