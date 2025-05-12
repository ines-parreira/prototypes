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
import { useKpis } from 'pages/aiAgent/Overview/hooks/useKpis'
import { KpiMetric } from 'pages/aiAgent/Overview/types'
import { STATS_ROUTES } from 'routes/constants'
import { getCleanStatsFiltersWithTimezone } from 'state/ui/stats/selectors'

import css from './KpiSection.less'

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
                            metricFormat={metric.metricFormat}
                            currency={metric.currency}
                            data-candu-id={metric['data-candu-id']}
                            action={metric.action}
                            hideTrend={metric.hideTrend}
                        />
                    )
                })}
        </div>
    )
}

const Kpis = ({
    aiAgentType,
    isOnNewPlan,
    showEarlyAccessModal,
    showActivationModal,
}: {
    aiAgentType?: AiAgentType
    isOnNewPlan: boolean
    showEarlyAccessModal: () => void
    showActivationModal: () => void
}) => {
    const filters: StatsFilters = useMemo(
        () => ({
            period: {
                start_datetime: moment()
                    .subtract(28, 'days')
                    .startOf('day')
                    .format(),
                end_datetime: moment().endOf('day').format(),
            },
        }),
        [],
    )
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)
    const { metrics } = useKpis({
        filters,
        timezone: userTimezone,
        aiAgentType,
        isOnNewPlan,
        showEarlyAccessModal,
        showActivationModal,
    })

    return <KpiContainer metrics={metrics} />
}

type Props = {
    isOnNewPlan: boolean
    showEarlyAccessModal: () => void
    showActivationModal: () => void
}
export const KpiSection = ({
    isOnNewPlan,
    showEarlyAccessModal,
    showActivationModal,
}: Props) => {
    const { isLoading, aiAgentType } = useAiAgentTypeForAccount()
    const hasAnalytics = useFlags()[FeatureFlagKey.AiShoppingAssistantEnabled]

    const analyticsLink = useMemo(() => {
        if (isLoading) {
            return ''
        }

        if (aiAgentType === 'sales' || aiAgentType === 'mixed') {
            return `/app/stats/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}`
        }

        return `/app/stats/${STATS_ROUTES.AUTOMATE_AI_AGENTS}`
    }, [isLoading, aiAgentType])

    if (isLoading) {
        return (
            <OverviewCard>
                <div className={css.titleWrapper}>
                    <div className={css.title}>
                        <CardTitle>AI Agent performance</CardTitle>
                    </div>
                    <div className={css.subtitle}>Data from last 28 days</div>
                </div>

                <KpiContainer isLoading />
            </OverviewCard>
        )
    }

    return (
        <OverviewCard data-candu-id="ai-agent-overview-performance-block">
            <div className={css.titleWrapper}>
                <div className={css.title}>
                    <CardTitle>AI Agent performance</CardTitle>
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

            <Kpis
                aiAgentType={aiAgentType}
                showActivationModal={showActivationModal}
                showEarlyAccessModal={showEarlyAccessModal}
                isOnNewPlan={isOnNewPlan}
            />
        </OverviewCard>
    )
}
