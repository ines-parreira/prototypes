import { useGridSize } from '@repo/hooks'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { Period } from 'domains/reporting/models/stat/types'
import { HintTooltip } from 'domains/reporting/pages/common/HintTooltip'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { PeriodShortcutSelector } from 'domains/reporting/pages/voice-of-customer/side-panel/TrendOverviewReport/PeriodShortcutSelector'
import { TrendOverviewChart } from 'domains/reporting/pages/voice-of-customer/side-panel/TrendOverviewReport/TrendOverviewChartConfig'
import css from 'domains/reporting/pages/voice-of-customer/side-panel/TrendOverviewReport/TrendOverviewReport.less'
import { TrendOverviewReportConfig } from 'domains/reporting/pages/voice-of-customer/side-panel/TrendOverviewReport/TrendOverviewReportConfig'
import { formatDateRange } from 'domains/reporting/pages/voice-of-customer/utils'

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
            <DashboardSection className="pb-0">
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
