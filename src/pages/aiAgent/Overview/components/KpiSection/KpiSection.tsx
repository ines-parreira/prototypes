import moment from 'moment'
import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'
import {Kpi} from 'pages/aiAgent/components/Kpi/Kpi'
import {CardTitle} from 'pages/aiAgent/Onboarding/components/Card'
import {Subtitle} from 'pages/aiAgent/Onboarding/components/Subtitle/Subtitle'
import {OverviewCard} from 'pages/aiAgent/Overview/components/OverviewCard/OverviewCard'
import {
    AiAgentType,
    useAiAgentTypeForAccount,
} from 'pages/aiAgent/Overview/hooks/useAiAgentType'

import {useMixedKpis} from 'pages/aiAgent/Overview/hooks/useMixedKpis'
import {useSalesKpis} from 'pages/aiAgent/Overview/hooks/useSalesKpis'
import {useSupportKpis} from 'pages/aiAgent/Overview/hooks/useSupportKpis'

import {KpiMetric} from 'pages/aiAgent/Overview/types'

import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

import css from './KpiSection.less'

type KpiProps = {
    filters: StatsFilters
    timezone: string
}

const KpiContainer = ({
    isLoading = false,
    metrics,
}: {
    isLoading?: boolean
    metrics?: KpiMetric[]
}) => {
    if (isLoading || !metrics?.length) {
        return (
            <div className={css.kpiContainer}>
                <Kpi isLoading />
                <Kpi isLoading />
                <Kpi isLoading />
                <Kpi isLoading />
            </div>
        )
    }

    return (
        <div className={css.kpiContainer}>
            {metrics.map((metric) => {
                return (
                    <Kpi
                        key={metric.title}
                        isLoading={metric.isLoading}
                        value={metric.value ?? 0}
                        prevValue={metric.prevValue ?? 0}
                        title={metric.title}
                        hint={metric.hint}
                        metricType={metric.metricType}
                    />
                )
            })}
        </div>
    )
}

const SalesKpi = ({filters, timezone}: KpiProps) => {
    const {metrics} = useSalesKpis(filters, timezone)
    return <KpiContainer metrics={metrics} />
}
const SupportKpi = ({filters, timezone}: KpiProps) => {
    const {metrics} = useSupportKpis(filters, timezone)
    return <KpiContainer metrics={metrics} />
}
const MixedKpi = ({filters, timezone}: KpiProps) => {
    const {metrics} = useMixedKpis(filters, timezone)
    return <KpiContainer metrics={metrics} />
}

const KpiForAiAgentType = ({
    isLoading,
    aiAgentType,
}: {
    isLoading: boolean
    aiAgentType?: AiAgentType
}) => {
    const filters: StatsFilters = {
        period: {
            start_datetime: moment()
                .subtract(28, 'days')
                .startOf('day')
                .format(),
            end_datetime: moment().format(),
        },
    }
    const {userTimezone} = useAppSelector(getCleanStatsFiltersWithTimezone)

    if (isLoading || !aiAgentType) {
        return <KpiContainer isLoading />
    }

    switch (aiAgentType) {
        case 'sales':
            return <SalesKpi filters={filters} timezone={userTimezone} />
        case 'support':
            return <SupportKpi filters={filters} timezone={userTimezone} />
        case 'mixed':
            return <MixedKpi filters={filters} timezone={userTimezone} />
    }
}

export const KpiSection = () => {
    const {isLoading, aiAgentType} = useAiAgentTypeForAccount()

    return (
        <OverviewCard>
            <div>
                <CardTitle>AI Agent Performance</CardTitle>
                <Subtitle>Data from last 28 days</Subtitle>
            </div>

            <KpiForAiAgentType
                aiAgentType={aiAgentType}
                isLoading={isLoading}
            />
        </OverviewCard>
    )
}
