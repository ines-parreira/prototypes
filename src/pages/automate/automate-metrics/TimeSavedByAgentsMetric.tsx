import React from 'react'

import BigNumberMetric from 'pages/stats/BigNumberMetric'
import MetricCard from 'pages/stats/MetricCard'
import TrendBadge from 'pages/stats/TrendBadge'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'

import {TIME_SAVED_BY_AGENTS} from './constants'
import {getTrendProps, toDuration} from './utils'

type Props = {
    ticketHandleTimeTrend: MetricTrend
    automatedInteractionTrend: MetricTrend
}

export const TimeSavedByAgentsMetric: React.FC<Props> = ({
    ticketHandleTimeTrend,
    automatedInteractionTrend,
}) => {
    const combinedTrend: MetricTrend = {
        isFetching:
            ticketHandleTimeTrend.isFetching ||
            automatedInteractionTrend.isFetching,
        isError:
            ticketHandleTimeTrend.isError || automatedInteractionTrend.isError,
        data: {
            value:
                (ticketHandleTimeTrend.data?.value ?? 0) *
                (automatedInteractionTrend.data?.value ?? 0),
            prevValue:
                (ticketHandleTimeTrend.data?.prevValue ?? 0) *
                (automatedInteractionTrend.data?.prevValue ?? 0),
        },
    }

    return (
        <MetricCard
            title={TIME_SAVED_BY_AGENTS}
            hint={{
                title: 'How much time agents would have spent resolving customer inquiries without Gorgias Automate.',
            }}
            isLoading={combinedTrend.isFetching}
        >
            <BigNumberMetric
                isLoading={combinedTrend.isFetching}
                trendBadge={<TrendBadge {...getTrendProps(combinedTrend)} />}
            >
                {toDuration(combinedTrend)}
            </BigNumberMetric>
        </MetricCard>
    )
}
