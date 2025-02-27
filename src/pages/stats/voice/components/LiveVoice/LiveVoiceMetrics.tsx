import React, { useMemo } from 'react'

import { LiveCallQueueVoiceCall } from '@gorgias/api-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { StatsFiltersWithLogicalOperator } from 'models/stat/types'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'

import { LiveVoiceMetricCard } from './LiveVoiceMetricCard'
import {
    getLiveVoiceMetricCards,
    getOldLiveVoiceMetricCards,
} from './LiveVoiceMetricsConfig'
import { getLiveVoicePeriodFilter } from './utils'

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
    const shouldShowNewUnansweredStatuses = useFlag(
        FeatureFlagKey.ShowNewUnansweredStatuses,
    )

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

    const metricCards = useMemo(() => {
        return shouldShowNewUnansweredStatuses
            ? getLiveVoiceMetricCards(
                  liveVoiceCalls,
                  isLoadingVoiceCalls,
                  filters,
                  timezone,
              )
            : getOldLiveVoiceMetricCards(
                  liveVoiceCalls,
                  isLoadingVoiceCalls,
                  filters,
                  timezone,
              )
    }, [
        liveVoiceCalls,
        isLoadingVoiceCalls,
        filters,
        timezone,
        shouldShowNewUnansweredStatuses,
    ])

    return (
        <DashboardSection>
            {metricCards.map((card) => (
                <DashboardGridCell size={card.size} key={card.title}>
                    <LiveVoiceMetricCard {...card} />
                </DashboardGridCell>
            ))}
        </DashboardSection>
    )
}
