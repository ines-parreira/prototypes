import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import moment from 'moment'
import { NavLink } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'
import { CardTitle } from 'pages/aiAgent/components/Card'
import { Kpi } from 'pages/aiAgent/components/Kpi/Kpi'
import { OverviewCard } from 'pages/aiAgent/Overview/components/OverviewCard/OverviewCard'
import type { AiAgentType } from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { useAiAgentTypeForAccount } from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { useKpis } from 'pages/aiAgent/Overview/hooks/useKpis'
import type { KpiMetric } from 'pages/aiAgent/Overview/types'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import { STATS_ROUTES } from 'routes/constants'

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
    aiAgentUserId,
    isOnNewPlan,
    showEarlyAccessModal,
    showActivationModal,
    shopName,
}: {
    aiAgentType?: AiAgentType
    aiAgentUserId: number
    isOnNewPlan: boolean
    showEarlyAccessModal: () => void
    showActivationModal: () => void
    shopName?: string
}) => {
    const { automationRateFilters, filters } = useMemo(() => {
        const start_datetime = moment()
            .subtract(28, 'days')
            .startOf('day')
            .format()

        return {
            automationRateFilters: {
                period: {
                    start_datetime,
                    end_datetime: moment()
                        .subtract(3, 'days')
                        .endOf('day')
                        .format(),
                },
            },
            filters: {
                period: {
                    start_datetime,
                    end_datetime: moment().endOf('day').format(),
                },
            },
        }
    }, [])
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)
    const { metrics } = useKpis({
        automationRateFilters,
        filters,
        timezone: userTimezone,
        aiAgentType,
        aiAgentUserId,
        isOnNewPlan,
        showEarlyAccessModal,
        showActivationModal,
        shopName,
    })

    return <KpiContainer metrics={metrics} />
}

type Props = {
    isOnNewPlan: boolean
    showEarlyAccessModal: () => void
    showActivationModal: () => void
    shopName?: string
}
export const KpiSection = ({
    isOnNewPlan,
    showEarlyAccessModal,
    showActivationModal,
    shopName,
}: Props) => {
    const { isLoading, aiAgentType } = useAiAgentTypeForAccount()
    const aiAgentUserId = useAIAgentUserId()
    const hasAnalytics = useFlag(FeatureFlagKey.AiShoppingAssistantEnabled)

    const analyticsLink = useMemo(() => {
        if (isLoading) {
            return ''
        }

        return `/app/stats/${STATS_ROUTES.AI_AGENT_OVERVIEW}`
    }, [isLoading])

    if (isLoading || !aiAgentUserId) {
        return (
            <OverviewCard>
                <div className={css.titleWrapper}>
                    <div className={css.title}>
                        <CardTitle>AI Agent performance</CardTitle>
                    </div>
                    <div className={css.subtitle}>
                        Data from last 28 days
                        <IconTooltip className={css.iconTooltip}>
                            Data for the past 72 hours is not included in these
                            metrics, as interactions are considered automated
                            after 72 hours have passed without a customer reply.
                        </IconTooltip>
                    </div>
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
                        <NavLink to={analyticsLink} exact target="_blank">
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
                <div className={css.subtitle}>
                    Data from last 28 days
                    <IconTooltip className={css.iconTooltip}>
                        Data for the past 72 hours is not included in these
                        metrics, as interactions are considered automated after
                        72 hours have passed without a customer reply.
                    </IconTooltip>
                </div>
            </div>

            <Kpis
                aiAgentType={aiAgentType}
                aiAgentUserId={aiAgentUserId}
                showActivationModal={showActivationModal}
                showEarlyAccessModal={showEarlyAccessModal}
                isOnNewPlan={isOnNewPlan}
                shopName={shopName}
            />
        </OverviewCard>
    )
}
