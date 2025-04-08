import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { ProductType } from 'models/billing/types'
import { FilterKey } from 'models/stat/types'
import withProductEnabledPaywall from 'pages/common/utils/withProductEnabledPaywall'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import { VoiceOverviewDownloadDataButton } from 'pages/stats/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
import {
    CALL_ACTIVITY_TITLE,
    VOICE_OVERVIEW_PAGE_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import {
    VoiceOverviewChart,
    VoiceOverviewReportConfig,
} from 'pages/stats/voice/pages/VoiceOverviewReportConfig'
import VoicePaywall from 'pages/stats/voice/VoicePaywall'
import { AccountFeature } from 'state/currentAccount/types'

function VoiceOverview() {
    const exposeQueues = useFlag(FeatureFlagKey.ExposeVoiceQueues)
    useCleanStatsFilters()

    const reportComponents = [
        {
            chart: VoiceOverviewChart.VoiceCallVolumeTotalCallCountTrendChart,
            size: 4,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricOutboundCallsCountTrend,
            size: 4,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricInboundCallsCountTrend,
            size: 4,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricUnansweredCallsCountTrendChart,
            size: 3,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricMissedCallsCountTrendChart,
            size: 3,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricCancelledCallsCountTrendChart,
            size: 3,
        },
        {
            chart: VoiceOverviewChart.VoiceCallVolumeMetricAbandonedCallsCountTrendChart,
            size: 3,
        },
        {
            chart: VoiceOverviewChart.VoiceCallCallerExperienceAverageWaitTimeChart,
            size: 6,
        },
        {
            chart: VoiceOverviewChart.VoiceCallCallerExperienceAverageTalkTime,
            size: 6,
        },
    ]

    return (
        <StatsPage
            title={VOICE_OVERVIEW_PAGE_TITLE}
            titleExtra={
                <>
                    <VoiceOverviewDownloadDataButton />
                </>
            }
        >
            <DashboardSection>
                <DashboardGridCell size={12} className="pb-0">
                    <FiltersPanelWrapper
                        persistentFilters={
                            VoiceOverviewReportConfig.reportFilters.persistent
                        }
                        optionalFilters={
                            exposeQueues
                                ? VoiceOverviewReportConfig.reportFilters
                                      .optional
                                : VoiceOverviewReportConfig.reportFilters.optional.filter(
                                      (filter) =>
                                          filter !== FilterKey.VoiceQueues,
                                  )
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

            <DashboardSection>
                {reportComponents.map((reportComponent) => (
                    <DashboardGridCell
                        size={reportComponent.size}
                        key={reportComponent.chart}
                    >
                        <DashboardComponent
                            chart={reportComponent.chart}
                            config={VoiceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                ))}
            </DashboardSection>
            <DashboardSection title={CALL_ACTIVITY_TITLE}>
                <DashboardGridCell>
                    <DashboardComponent
                        chart={VoiceOverviewChart.VoiceCallTableChart}
                        config={VoiceOverviewReportConfig}
                    />
                </DashboardGridCell>
            </DashboardSection>
            <AnalyticsFooter />
        </StatsPage>
    )
}

export default withProductEnabledPaywall(
    ProductType.Voice,
    AccountFeature.PhoneNumber,
    VoicePaywall,
)(VoiceOverview)
