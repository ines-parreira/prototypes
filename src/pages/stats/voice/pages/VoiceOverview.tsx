import React, {useState} from 'react'
import moment from 'moment/moment'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import StatsPage from 'pages/stats/StatsPage'
import {
    CALL_ACTIVITY_TITLE,
    CALL_LIST_TITLE,
    CALL_VOLUME_METRICS_TITLE,
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
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import {AccountFeature} from 'state/currentAccount/types'
import {getPageStatsFilters} from 'state/stats/selectors'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {getPhoneIntegrations} from 'state/integrations/selectors'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import ChartCard from 'pages/stats/ChartCard'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import VoiceCallVolumeMetric from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {VoiceCallTable} from 'pages/stats/voice/components/VoiceCallTable/VoiceCallTable'
import VoiceCallDirectionFilter from 'pages/stats/voice/components/VoiceCallDirectionFilter/VoiceCallDirectionFilter'
import {VoiceCallFilterOptions} from 'pages/stats/voice/models/types'

function VoiceOverview() {
    const displayVoiceAnalyticsNiceToHave: boolean =
        useFlags()[FeatureFlagKey.DisplayVoiceAnalyticsNiceToHave] || false
    const [tableFilterOption, setTableFilterOption] = useState(
        VoiceCallFilterOptions.All
    )
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    const phoneIntegrations = useAppSelector(getPhoneIntegrations)
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    useCleanStatsFilters(pageStatsFilters)

    return (
        <StatsPage
            title={VOICE_OVERVIEW_PAGE_TITLE}
            filters={
                <>
                    <IntegrationsStatsFilter
                        value={pageStatsFilters.integrations}
                        integrations={phoneIntegrations}
                        isMultiple
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
                </>
            }
        >
            <DashboardSection title={CALL_VOLUME_METRICS_TITLE}>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetric
                        title={TOTAL_CALLS_METRIC_TITLE}
                        hint={TOTAL_CALLS_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        userTimezone={userTimezone}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetric
                        title={OUTBOUND_CALLS_METRIC_TITLE}
                        hint={OUTBOUND_CALLS_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        userTimezone={userTimezone}
                        segment={VoiceCallSegment.outboundCalls}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetric
                        title={INBOUND_CALLS_METRIC_TITLE}
                        hint={INBOUND_CALLS_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        userTimezone={userTimezone}
                        segment={VoiceCallSegment.inboundCalls}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <VoiceCallVolumeMetric
                        title={MISSED_CALLS_METRIC_TITLE}
                        hint={MISSED_CALLS_METRIC_HINT}
                        statsFilters={cleanStatsFilters}
                        userTimezone={userTimezone}
                        segment={VoiceCallSegment.missedCalls}
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
                            displayVoiceAnalyticsNiceToHave && (
                                <VoiceCallDirectionFilter
                                    onFilterSelect={(
                                        option: VoiceCallFilterOptions
                                    ) => setTableFilterOption(option)}
                                />
                            )
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

export default withFeaturePaywall(AccountFeature.PhoneNumber)(VoiceOverview)
