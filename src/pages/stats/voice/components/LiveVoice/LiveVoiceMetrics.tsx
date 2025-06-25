import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'

import { LiveCallQueueVoiceCall } from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { DateTimeFormatMapper, DateTimeFormatType } from 'constants/datetime'
import useAppSelector from 'hooks/useAppSelector'
import { StatsFiltersWithLogicalOperator } from 'models/stat/types'
import useIsCallbackRequestsEnabled from 'pages/integrations/integration/components/voice/useIsCallbackRequestsEnabled'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'
import { formatDatetime } from 'utils'

import { LiveVoiceMetricCard } from './LiveVoiceMetricCard'
import useLiveVoiceMetricCards from './useLiveVoiceMetricCards'
import { getLiveVoicePeriodFilter } from './utils'

import css from './LiveVoiceMetrics.less'

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
    const isCallbackRequestsEnabled = useIsCallbackRequestsEnabled()

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
        isCallbackRequestsEnabled,
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
            {useLiveUpdates && lastUpdated && (
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
            )}
        </DashboardSection>
    )
}
