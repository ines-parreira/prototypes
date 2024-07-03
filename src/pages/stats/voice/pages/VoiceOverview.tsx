import React, {useMemo, useState} from 'react'
import moment from 'moment/moment'

import {logEvent, SegmentEvent} from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import StatsPage from 'pages/stats/StatsPage'
import {
    AVERAGE_TALK_TIME_METRIC_HINT,
    AVERAGE_TALK_TIME_METRIC_TITLE,
    AVERAGE_WAIT_TIME_METRIC_HINT,
    AVERAGE_WAIT_TIME_METRIC_TITLE,
    CALL_ACTIVITY_TITLE,
    CALL_LIST_TITLE,
    CALL_VOLUME_METRICS_TITLE,
    CALLER_EXPERIENCE_METRICS_TITLE,
    INBOUND_CALLS_METRIC_HINT,
    INBOUND_CALLS_METRIC_TITLE,
    MIN_DATE_FOR_VOICE_STATS,
    MISSED_CALLS_METRIC_HINT,
    MISSED_CALLS_METRIC_TITLE,
    OUTBOUND_CALLS_METRIC_HINT,
    OUTBOUND_CALLS_METRIC_TITLE,
    TOTAL_CALLS_METRIC_HINT,
    TOTAL_CALLS_METRIC_TITLE,
    VOICE_OVERVIEW_PAGE_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import {AccountFeature} from 'state/currentAccount/types'
import {getPageStatsFilters} from 'state/stats/selectors'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {getPhoneIntegrations} from 'state/integrations/selectors'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import AgentsStatsFilter from 'pages/stats/AgentsStatsFilter'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import ChartCard from 'pages/stats/ChartCard'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import VoiceCallVolumeMetric from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import VoiceCallCallerExperienceMetric from 'pages/stats/voice/components/VoiceCallerExperienceMetric/VoiceCallCallerExperienceMetric'
import {VoiceCallTable} from 'pages/stats/voice/components/VoiceCallTable/VoiceCallTable'
import VoiceCallDirectionFilter from 'pages/stats/voice/components/VoiceCallDirectionFilter/VoiceCallDirectionFilter'
import {
    VoiceCallAverageTimeMetric,
    VoiceCallFilterOptions,
} from 'pages/stats/voice/models/types'
import {useVoiceCallCountTrend} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import {useVoiceCallAverageTimeTrend} from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import {saveReport} from 'services/reporting/voiceOverviewReportingService'
import {VoiceOverviewDownloadDataButton} from 'pages/stats/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
import withProductEnabledPaywall from 'pages/common/utils/withProductEnabledPaywall'
import {ProductType} from 'models/billing/types'

function VoiceOverview() {
    const [tableFilterOption, setTableFilterOption] = useState(
        VoiceCallFilterOptions.All
    )
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    const phoneIntegrations = useAppSelector(getPhoneIntegrations)
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    useCleanStatsFilters(pageStatsFilters)

    const averageWaitTimeTrend = useVoiceCallAverageTimeTrend(
        VoiceCallAverageTimeMetric.WaitTime,
        cleanStatsFilters,
        userTimezone
    )
    const averageTalkTimeTrend = useVoiceCallAverageTimeTrend(
        VoiceCallAverageTimeMetric.TalkTime,
        cleanStatsFilters,
        userTimezone
    )
    const totalCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone
    )
    const outboundCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.outboundCalls
    )
    const inboundCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.inboundCalls
    )
    const missedCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.missedCalls
    )

    const exportableData = useMemo(() => {
        return {
            averageWaitTimeTrend,
            averageTalkTimeTrend,
            totalCallsCountTrend,
            outboundCallsCountTrend,
            inboundCallsCountTrend,
            missedCallsCountTrend,
        }
    }, [
        averageWaitTimeTrend,
        averageTalkTimeTrend,
        totalCallsCountTrend,
        outboundCallsCountTrend,
        inboundCallsCountTrend,
        missedCallsCountTrend,
    ])

    const loadingDownload = useMemo(() => {
        return Object.values(exportableData).some((metric) => metric.isFetching)
    }, [exportableData])

    return (
        <StatsPage
            title={VOICE_OVERVIEW_PAGE_TITLE}
            titleExtra={
                <>
                    <IntegrationsStatsFilter
                        value={pageStatsFilters.integrations}
                        integrations={phoneIntegrations}
                        isMultiple
                        variant={'ghost'}
                    />
                    <TagsStatsFilter
                        value={pageStatsFilters.tags}
                        variant={'ghost'}
                    />
                    <AgentsStatsFilter
                        value={pageStatsFilters.agents}
                        variant={'ghost'}
                    />
                    <PeriodStatsFilter
                        initialSettings={{
                            minDate: moment(
                                MIN_DATE_FOR_VOICE_STATS,
                                'YYYY-MM-DD'
                            ).toDate(),
                            maxSpan: 365,
                        }}
                        value={pageStatsFilters.period}
                        variant={'ghost'}
                    />
                    <VoiceOverviewDownloadDataButton
                        onClick={async () => {
                            logEvent(SegmentEvent.StatDownloadClicked, {
                                name: 'all-metrics',
                            })
                            await saveReport(
                                exportableData,
                                pageStatsFilters.period
                            )
                        }}
                        disabled={loadingDownload}
                    />
                </>
            }
        >
            <DashboardSection title={CALLER_EXPERIENCE_METRICS_TITLE}>
                <DashboardGridCell size={6}>
                    <VoiceCallCallerExperienceMetric
                        title={AVERAGE_WAIT_TIME_METRIC_TITLE}
                        hint={AVERAGE_WAIT_TIME_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        metricTrend={averageWaitTimeTrend}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={6}>
                    <VoiceCallCallerExperienceMetric
                        title={AVERAGE_TALK_TIME_METRIC_TITLE}
                        hint={AVERAGE_TALK_TIME_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        metricTrend={averageTalkTimeTrend}
                    />
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection title={CALL_VOLUME_METRICS_TITLE}>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetric
                        title={TOTAL_CALLS_METRIC_TITLE}
                        hint={TOTAL_CALLS_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        metricTrend={totalCallsCountTrend}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetric
                        title={OUTBOUND_CALLS_METRIC_TITLE}
                        hint={OUTBOUND_CALLS_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        metricTrend={outboundCallsCountTrend}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetric
                        title={INBOUND_CALLS_METRIC_TITLE}
                        hint={INBOUND_CALLS_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        metricTrend={inboundCallsCountTrend}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetric
                        title={MISSED_CALLS_METRIC_TITLE}
                        hint={MISSED_CALLS_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        metricTrend={missedCallsCountTrend}
                        moreIsBetter={false}
                    />
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection title={CALL_ACTIVITY_TITLE}>
                <DashboardGridCell>
                    <ChartCard
                        title={CALL_LIST_TITLE}
                        noPadding
                        titleExtra={
                            <VoiceCallDirectionFilter
                                onFilterSelect={(
                                    option: VoiceCallFilterOptions
                                ) => setTableFilterOption(option)}
                            />
                        }
                    >
                        <VoiceCallTable
                            statsFilters={cleanStatsFilters}
                            userTimezone={userTimezone}
                            filterOption={tableFilterOption}
                        />
                    </ChartCard>
                </DashboardGridCell>
            </DashboardSection>
            <AnalyticsFooter />
        </StatsPage>
    )
}

export default withProductEnabledPaywall(
    ProductType.Voice,
    AccountFeature.PhoneNumber
)(VoiceOverview)
