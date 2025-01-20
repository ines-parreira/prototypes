import moment from 'moment/moment'

import React, {useMemo} from 'react'

import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import {ProductType} from 'models/billing/types'
import {FilterKey} from 'models/stat/types'
import withProductEnabledPaywall from 'pages/common/utils/withProductEnabledPaywall'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import DEPRECATED_AgentsStatsFilter from 'pages/stats/common/filters/DEPRECATED_AgentsStatsFilter'
import DEPRECATED_IntegrationsStatsFilter from 'pages/stats/common/filters/DEPRECATED_IntegrationsStatsFilter'
import DEPRECATED_PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import DEPRECATED_TagsStatsFilter from 'pages/stats/common/filters/DEPRECATED_TagsStatsFilter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {VoiceCallCallCallerExperiencAverageTalkTime} from 'pages/stats/voice/charts/VoiceCallCallerExperiencAverageTalkTime'
import {VoiceCallCallerExperienceAverageWaitTimeChart} from 'pages/stats/voice/charts/VoiceCallCallerExperienceAverageWaitTimeChart'
import {VoiceCallTableChart} from 'pages/stats/voice/charts/VoiceCallTableChart'
import {VoiceCallVolumeMetricInboundCallsCountTrend} from 'pages/stats/voice/charts/VoiceCallVolumeMetricInboundCallsCountTrendChart'
import {VoiceCallVolumeMetricMissedCallsCountTrendChart} from 'pages/stats/voice/charts/VoiceCallVolumeMetricMissedCallsCountTrendChart'
import {VoiceCallVolumeMetricOutboundCallsCountTrend} from 'pages/stats/voice/charts/VoiceCallVolumeMetricOutboundCallsCountTrend'
import {VoiceCallVolumeTotalCallCountTrendChart} from 'pages/stats/voice/charts/VoiceCallVolumeTotalCallCountTrendChart'
import {VoiceOverviewDownloadDataButton} from 'pages/stats/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
import {
    CALL_ACTIVITY_TITLE,
    CALL_VOLUME_METRICS_TITLE,
    CALLER_EXPERIENCE_METRICS_TITLE,
    MIN_DATE_FOR_VOICE_STATS,
    VOICE_OVERVIEW_PAGE_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import {useNewVoiceStatsFilters} from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import {VoiceOverviewReportConfig} from 'pages/stats/voice/pages/VoiceOverviewReportConfig'
import VoicePaywall from 'pages/stats/voice/VoicePaywall'

import {AccountFeature} from 'state/currentAccount/types'
import {getPhoneIntegrations} from 'state/integrations/selectors'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

function VoiceOverview() {
    const {isAnalyticsNewFilters} = useNewVoiceStatsFilters()
    const voiceOverviewOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            VoiceOverviewReportConfig.reportFilters.optional
        )
    const {cleanStatsFilters: legacyStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    const phoneIntegrations = useAppSelector(getPhoneIntegrations)

    const pageStatsFilters = useAppSelector(
        getPageStatsFiltersWithLogicalOperators
    )
    useCleanStatsFiltersWithLogicalOperators(pageStatsFilters)

    const voiceFilters = useMemo(
        () =>
            !isAnalyticsNewFilters ? (
                <>
                    <DEPRECATED_IntegrationsStatsFilter
                        value={pageStatsFilters.integrations?.values}
                        integrations={phoneIntegrations}
                        isMultiple
                        variant={'ghost'}
                    />
                    <DEPRECATED_TagsStatsFilter
                        value={legacyStatsFilters.tags}
                        variant={'ghost'}
                    />
                    <DEPRECATED_AgentsStatsFilter
                        value={pageStatsFilters.agents?.values}
                        variant={'ghost'}
                    />
                    <DEPRECATED_PeriodStatsFilter
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
                </>
            ) : null,
        [
            isAnalyticsNewFilters,
            legacyStatsFilters.tags,
            pageStatsFilters.agents?.values,
            pageStatsFilters.integrations?.values,
            pageStatsFilters.period,
            phoneIntegrations,
        ]
    )

    return (
        <StatsPage
            title={VOICE_OVERVIEW_PAGE_TITLE}
            titleExtra={
                <>
                    {voiceFilters}
                    <VoiceOverviewDownloadDataButton />
                </>
            }
        >
            {isAnalyticsNewFilters && (
                <DashboardSection>
                    <DashboardGridCell size={12} className="pb-0">
                        <FiltersPanelWrapper
                            persistentFilters={
                                VoiceOverviewReportConfig.reportFilters
                                    .persistent
                            }
                            optionalFilters={voiceOverviewOptionalFilters}
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
            )}

            <DashboardSection title={CALLER_EXPERIENCE_METRICS_TITLE}>
                <DashboardGridCell size={6}>
                    <VoiceCallCallerExperienceAverageWaitTimeChart />
                </DashboardGridCell>
                <DashboardGridCell size={6}>
                    <VoiceCallCallCallerExperiencAverageTalkTime />
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection title={CALL_VOLUME_METRICS_TITLE}>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeTotalCallCountTrendChart />
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetricOutboundCallsCountTrend />
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetricInboundCallsCountTrend />
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetricMissedCallsCountTrendChart />
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection title={CALL_ACTIVITY_TITLE}>
                <DashboardGridCell>
                    <VoiceCallTableChart />
                </DashboardGridCell>
            </DashboardSection>
            <AnalyticsFooter />
        </StatsPage>
    )
}

export default withProductEnabledPaywall(
    ProductType.Voice,
    AccountFeature.PhoneNumber,
    VoicePaywall
)(VoiceOverview)
