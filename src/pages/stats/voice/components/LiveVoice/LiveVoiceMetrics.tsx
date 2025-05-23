import { useMemo } from 'react'

import { LiveCallQueueVoiceCall } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import { StatsFiltersWithLogicalOperator } from 'models/stat/types'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'

import { LiveVoiceMetricCard } from './LiveVoiceMetricCard'
import { getLiveVoiceMetricCards } from './LiveVoiceMetricsConfig'
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

    const metricCards = useMemo(
        () =>
            getLiveVoiceMetricCards(
                liveVoiceCalls,
                isLoadingVoiceCalls,
                filters,
                timezone,
            ),
        [liveVoiceCalls, isLoadingVoiceCalls, filters, timezone],
    )

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
