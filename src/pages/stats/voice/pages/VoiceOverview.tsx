import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import StatsPage from 'pages/stats/StatsPage'
import {
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
import {getStandardPhoneIntegrations} from 'state/integrations/selectors'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import VoiceCallVolumeMetric from '../components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import PeriodStatsFilter from '../../PeriodStatsFilter'

function VoiceOverview() {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    const phoneIntegrations = useAppSelector(getStandardPhoneIntegrations)
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
                    />
                    <PeriodStatsFilter
                        initialSettings={{
                            minDate: new Date(MIN_DATE_FOR_VOICE_STATS),
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
        </StatsPage>
    )
}

export default withFeaturePaywall(AccountFeature.PhoneNumber)(VoiceOverview)
