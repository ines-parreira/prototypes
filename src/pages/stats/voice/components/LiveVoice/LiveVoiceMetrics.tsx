import { useMemo } from 'react'

import { LiveCallQueueVoiceCall } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import { StatsFiltersWithLogicalOperator } from 'models/stat/types'
import useIsCallbackRequestsEnabled from 'pages/integrations/integration/components/voice/useIsCallbackRequestsEnabled'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'

import { LiveVoiceMetricCard } from './LiveVoiceMetricCard'
import useLiveVoiceMetricCards from './useLiveVoiceMetricCards'
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
