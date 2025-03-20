import React, { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'
import { NavLink } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { StatsFilters } from 'models/stat/types'
import { Kpi } from 'pages/aiAgent/components/Kpi/Kpi'
import { CardTitle } from 'pages/aiAgent/Onboarding/components/Card'
import { OverviewCard } from 'pages/aiAgent/Overview/components/OverviewCard/OverviewCard'
import {
    AiAgentType,
    useAiAgentTypeForAccount,
} from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { useMixedKpis } from 'pages/aiAgent/Overview/hooks/useMixedKpis'
import { useSalesKpis } from 'pages/aiAgent/Overview/hooks/useSalesKpis'
import { useSupportKpis } from 'pages/aiAgent/Overview/hooks/useSupportKpis'
import { KpiMetric } from 'pages/aiAgent/Overview/types'
import { STATS_ROUTES } from 'routes/constants'
import { getCleanStatsFiltersWithTimezone } from 'state/ui/stats/selectors'

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
            {metrics
                .filter((it) => !it.hidden)
                .map((metric) => {
                    return (
                        <Kpi
                            key={metric.title}
                            isLoading={metric.isLoading}
                            value={metric.value ?? 0}
                            prevValue={metric.prevValue ?? undefined}
                            title={metric.title}
                            hint={metric.hint}
                            metricType={metric.metricType}
                            metricFormat={metric.metricFormat}
                            data-candu-id={metric['data-candu-id']}
                        />
                    )
                })}
        </div>
    )
}

const SalesKpi = ({ filters, timezone }: KpiProps) => {
    const { metrics } = useSalesKpis(filters, timezone)
    return <KpiContainer metrics={metrics} />
}
const SupportKpi = ({ filters, timezone }: KpiProps) => {
    const { metrics } = useSupportKpis(filters, timezone)
    return <KpiContainer metrics={metrics} />
}
const MixedKpi = ({ filters, timezone }: KpiProps) => {
    const { metrics } = useMixedKpis(filters, timezone)
    return <KpiContainer metrics={metrics} />
}

const KpiForAiAgentType = ({
    isLoading,
    aiAgentType,
}: {
    isLoading: boolean
    aiAgentType?: AiAgentType
}) => {
    const filters: StatsFilters = useMemo(
        () => ({
            period: {
                start_datetime: moment()
                    .subtract(28, 'days')
                    .startOf('day')
                    .format(),
                end_datetime: moment().format(),
            },
        }),
        [],
    )
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)

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
    const { isLoading, aiAgentType } = useAiAgentTypeForAccount()
    const hasAnalytics =
        useFlags()[FeatureFlagKey.StandaloneAiSalesAnalyticsPage]

    const analyticsLink = useMemo(() => {
        if (isLoading) {
            return ''
        }

        if (aiAgentType === 'sales' || aiAgentType === 'mixed') {
            return `/app/stats/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}`
        }

        return `/app/stats/${STATS_ROUTES.AUTOMATE_AI_AGENTS}`
    }, [isLoading, aiAgentType])

    return (
        <OverviewCard data-candu-id="ai-agent-overview-performance-block">
            <div className={css.titleWrapper}>
                <div className={css.title}>
                    <CardTitle>AI Agent Performance</CardTitle>
                    {hasAnalytics && (
                        <NavLink to={analyticsLink} exact>
                            <Button
                                intent="secondary"
                                size="small"
                                trailingIcon="open_in_new"
                                isLoading={isLoading}
                            >
                                View Full Report
                            </Button>
                        </NavLink>
                    )}
                </div>
                <div className={css.subtitle}>Data from last 28 days</div>
            </div>

            <KpiForAiAgentType
                aiAgentType={aiAgentType}
                isLoading={isLoading}
            />
        </OverviewCard>
    )
}
