import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'

import { LiveCallQueueVoiceCall } from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { DateTimeFormatMapper, DateTimeFormatType } from 'constants/datetime'
import { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import { LiveVoiceMetricCard } from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceMetricCard'
import css from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceMetrics.less'
import useLiveVoiceMetricCards from 'domains/reporting/pages/voice/components/LiveVoice/useLiveVoiceMetricCards'
import { getLiveVoicePeriodFilter } from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import useAppSelector from 'hooks/useAppSelector'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'
import { formatDatetime } from 'utils'

type Props = {
    liveVoiceCalls: LiveCallQueueVoiceCall[]
    isLoadingVoiceCalls: boolean
    cleanStatsFilters: StatsFiltersWithLogicalOperator
}

export default function LiveVoiceMetrics({
    liveVoiceCalls,
    isLoadingVoiceCalls,
    cleanStatsFilters,
}: Props) {
    const useLiveUpdates = useFlags()[FeatureFlagKey.UseLiveVoiceUpdates]

    const {
        data: { timezone },
    } = useAppSelector(getBusinessHoursSettings) ?? {
        data: {
            timezone: 'UTC',
        },
    }

    const filters = useMemo(() => {
        return {
            ...cleanStatsFilters,
            period: getLiveVoicePeriodFilter(timezone),
        }
    }, [cleanStatsFilters, timezone])

    const metricCards = useLiveVoiceMetricCards(
        liveVoiceCalls,
        isLoadingVoiceCalls,
        filters,
    )

    // first metric card is always the "Calls in queue" metric,
    // so we need to check the second one for the last updated timestamp
    const lastUpdated = metricCards[1]?.metric.dataUpdatedAt

    return (
        <DashboardSection>
            {metricCards.map((card) => (
                <DashboardGridCell size={card.size} key={card.title}>
                    <LiveVoiceMetricCard {...card} />
                </DashboardGridCell>
            ))}
            {useLiveUpdates && lastUpdated ? (
                <DashboardGridCell className={css.metricCardInfoCell}>
                    <div className={css.metricCardInfo}>
                        <i className={'material-icons'}>sync</i>
                        KPI cards last updated:{' '}
                        {formatDatetime(
                            moment.unix(lastUpdated / 1000),
                            DateTimeFormatMapper[
                                DateTimeFormatType.TIME_24HOUR
                            ],
                        )}{' '}
                        (auto-refresh every 30 seconds)
                    </div>
                </DashboardGridCell>
            ) : (
                <></>
            )}
        </DashboardSection>
    )
}
